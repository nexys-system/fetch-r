import { RowDataPacket, OkPacket } from "mysql2";
import * as Connection from "./database/connection";
import * as T from "./type";
import * as Meta from "./query-builder/meta";
import * as MutateService from "./query-builder/mutate";
import * as TT from "./query-builder/type";
import * as Parse from "./query-builder/parse";

const isRawDataPacket = (
  response: RowDataPacket[] | RowDataPacket
): response is RowDataPacket =>
  response.length > 0 && !Array.isArray(response[0]);

const handleReponse = async (
  response: RowDataPacket[] | RowDataPacket,
  qs: TT.MetaQuery[],
  model: T.Entity[],
  s: Connection.SQL
): Promise<T.ReturnUnit> => {
  if (!Array.isArray(response)) {
    throw Error("not an array");
  }

  // in case we requested only one query, the response is a single array, we call the function recursively to be able to handle it
  if (isRawDataPacket(response)) {
    return handleReponse([response], qs, model, s);
  }

  const responseParsed = response.map(
    async (x: RowDataPacket, metaIdx: number) => {
      const meta = qs[metaIdx];
      const main = Parse.parse(x, meta);

      // if references are present
      // 1. get ids of parent result
      // 2 do query but filter for the ids that are relevant
      // 3 insert result into current result
      const { references } = meta;
      if (references) {
        // create meta query from reference query
        const qs = Meta.createQuery(references, model);

        // adding filter
        const refs: {
          entity: string;
          mainUnit: TT.MetaQueryUnit;
          ids: number[];
        }[] = qs.map((q) => {
          // creating new filter

          // mainUnit: main entity of ref query
          const [mainUnit] = q.meta.units;
          // mainUnit: main entity of parent query
          const parentEntity = meta.units[0].entity;
          // get entity in ref that is same as parent
          const observedUnit = q.meta.units.find(
            (x) => x.entity === parentEntity
          );

          if (!observedUnit) {
            throw Error(
              "something when wrong when mapping entities with reference block: " +
                parentEntity
            );
          }

          // note: for now, does not support uuid
          const ids: number[] = main.map((row) => row.id);

          const metaFilter: TT.MetaFilter = {
            value: ids,
            operator: "in",
            column: "id",
            name: "id",
          };

          observedUnit.filters.push(metaFilter);

          return {
            entity: observedUnit.entity,
            mainUnit, // not to be confused with parent entity
            ids,
          };
        });

        const qs2 = Meta.createSQL(qs.map((x) => x.meta));
        const subResult = await execFromMeta(qs2, model, s);

        refs.map((ref) => {
          const modelUnit = model.find((m) => m.name === ref.mainUnit.entity);
          if (!modelUnit) {
            throw Error("Reference: could not find model for the right entity");
          }

          // by default join on `id`, but it can be overriden with `joinOn`
          // todo: check that field actually exists
          const joinOn: string | undefined =
            references[ref.mainUnit.entity].joinOn;

          const fieldUnit = modelUnit.fields.find(
            (f) => f.type === ref.entity && (!joinOn || f.name === joinOn)
          );

          if (!fieldUnit) {
            throw Error("could not apply joinOn - field misspelt?");
          }

          main.map((m) => {
            const filteredSubResult = subResult[ref.mainUnit.entity].filter(
              (x: any) => {
                return m.id === x[fieldUnit.name].id;
              }
            );

            m[ref.mainUnit.entity] =
              filteredSubResult === {} ? [] : filteredSubResult;
          });
        });
      }

      return main;
    }
  );

  const responseWithEntites: T.ReturnUnit = {};

  (await Promise.all(responseParsed)).forEach((responseEntity, i) => {
    const m = qs[i].units[0];
    responseWithEntites[m.entity] = responseEntity;
  });

  return responseWithEntites;
};

export const exec = async (
  mq: T.Query,
  entities: T.Entity[],
  s: Connection.SQL
): Promise<T.ReturnUnit> => {
  const qs = Meta.createQuery(mq, entities);

  return execFromMeta(qs, entities, s);
};

const execFromMeta = async (
  qs: {
    sql: string;
    meta: TT.MetaQuery;
  }[],
  entities: T.Entity[],
  s: Connection.SQL
): Promise<T.ReturnUnit> => {
  const sqlScript = qs.map((x) => x.sql).join("\n");

  // here we cast to RowDataPacket[] but theoretically it can also be RowDataPacket, it is checked downstream
  const [response] = await s.execQuery(sqlScript);

  return handleReponse(
    response as RowDataPacket,
    qs.map((x) => x.meta),
    entities,
    s
  );
};

const parseMutateInsert = (response: OkPacket): T.MutateResponseInsert => ({
  success: typeof response.insertId === "number",
  uuid: undefined,
  id: response.insertId,
  status: response.message,
});

const parseMutateUpdate = (response: OkPacket): T.MutateResponseUpdate => ({
  success: typeof response.insertId === "number",
  updated: response.affectedRows,
});

const parseMutateDelete = (response: OkPacket): T.MutateResponseDelete => ({
  success: typeof response.insertId === "number",
  deleted: response.affectedRows,
});

const getResultBasedOnType = (t: T.MutateType, response: OkPacket) => {
  switch (t) {
    case T.MutateType.insert:
      return { insert: parseMutateInsert(response) };
    case T.MutateType.update:
      return { update: parseMutateUpdate(response) };
    case T.MutateType.delete:
      return { delete: parseMutateDelete(response) };
  }
};

const parseMutate = (
  qs: { type: T.MutateType; entity: T.Entity }[],
  response: OkPacket
): T.MutateResponse => {
  const r: T.MutateResponse = {};

  qs.forEach(({ entity, type }) => {
    r[entity.name] = getResultBasedOnType(type, response);
  });

  return r;
};

export const mutate = async (
  mq: T.Mutate,
  entities: T.Entity[],
  s: Connection.SQL
): Promise<T.MutateResponse> => {
  const qs = MutateService.createMutateQuery(mq, entities);
  // console.log(qs.map((x) => x.sql).join("\n"));
  const [response] = await s.execQuery(qs.map((x) => x.sql).join("\n"));

  return parseMutate(qs, response as OkPacket);
};
