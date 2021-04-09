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

const handleReponse = (
  response: RowDataPacket[] | RowDataPacket,
  qs: TT.MetaQueryUnit[][]
): T.ReturnUnit => {
  if (!Array.isArray(response)) {
    throw Error("not an array");
  }

  // in case we requested only one query, the response is a single array, we call the function recursively to be able to handle it
  if (isRawDataPacket(response)) {
    return handleReponse([response], qs);
  }

  const responseParsed = response.map((x: RowDataPacket, i: number) =>
    Parse.parse(x, qs[i])
  );

  const responseWithEntites: T.ReturnUnit = {};

  responseParsed.forEach((responseEntity, i) => {
    const m = qs[i][0];
    responseWithEntites[m.entity] = responseEntity;
  });

  return responseWithEntites;
};

export const exec = async (
  mq: T.Query,
  entities: T.Entity[],
  s: Connection.SQL
) => {
  const qs = Meta.createQuery(mq, entities);
  const sqlScript = qs.map((x) => x.sql).join("\n");
  //console.log(sqlScript);
  //console.log(JSON.stringify(qs, null, 2));
  //console.log(qs.map((x) => x.meta));
  //console.log(qs.map((x) => x.sql));

  // here we cast to RowDataPacket[] but theoretically it can also be RowDataPacket, it is checked downstream
  const [response] = await s.execQuery(sqlScript);

  return handleReponse(
    response as RowDataPacket,
    qs.map((x) => x.meta.units)
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
