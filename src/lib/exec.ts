import { RowDataPacket, OkPacket } from "mysql2";
import * as Connection from "./database/connection";
import * as T from "./type";
import * as Meta from "./query-builder/meta";
import * as MutateService from "./query-builder/mutate";
import * as TT from "./query-builder/type";
import * as Parse from "./query-builder/parse";
import { prepare } from "./query-builder/references";

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

  const pResponseParsed = response.map(
    async (responseUnit: RowDataPacket, metaIdx: number) => {
      const meta = qs[metaIdx];

      const main = Parse.parse(responseUnit, meta);

      // if references are present
      // 1. get ids of parent result
      // 2 do query but filter for the ids that are relevant
      // 3 insert result into current result
      const { references } = meta;
      if (references) {
        await prepare(meta, main, references, model, s);
      }

      return main;
    }
  );

  const responseWithEntites: T.ReturnUnit = {};

  const responseParsed = await Promise.all(pResponseParsed);

  // loop through meta query, to get all the different queries
  // note that initially we would loop through the `responseParsed`, but there is an edge case that would then return nothing
  qs.forEach((q, i) => {
    const m = q.units[0];
    const responseEntity = responseParsed[i];

    if (!responseEntity) {
      responseWithEntites[m.entity] = {};
    } else {
      responseWithEntites[m.entity] = responseEntity;
    }
  });

  return responseWithEntites;
};

export const exec = async (
  mq: T.Query,
  entities: T.Entity[],
  s: Connection.SQL,
  options: { legacyMode: boolean } = { legacyMode: false }
): Promise<T.ReturnUnit> => {
  const qs = Meta.createQuery(mq, entities, options.legacyMode);

  return execFromMeta(qs, entities, s);
};

export const getSQLFromMeta = (
  qs: {
    sql: string;
    meta: TT.MetaQuery;
  }[]
): string => qs.map((x) => x.sql).join("\n");

export const getSQL = (mq: T.Query, entities: T.Entity[]) => {
  const qs = Meta.createQuery(mq, entities);
  return getSQLFromMeta(qs);
};

export const execFromMeta = async (
  qs: {
    sql: string;
    meta: TT.MetaQuery;
  }[],
  entities: T.Entity[],
  s: Connection.SQL
): Promise<T.ReturnUnit> => {
  const sqlScript = getSQLFromMeta(qs);

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

export const getSQLMutate = (mq: T.Mutate, entities: T.Entity[]): string => {
  const qs = MutateService.createMutateQuery(mq, entities);
  return qs.map((x) => x.sql).join("\n");
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
