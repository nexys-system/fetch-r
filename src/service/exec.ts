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

  console.log("parsed");

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

  // here we cast to RowDataPacket[] but theoreticfally it can also be RowDataPacket, it is checked downstream
  const [response] = await s.execQuery(sqlScript);

  return handleReponse(
    response as RowDataPacket,
    qs.map((x) => x.meta.units)
  );
};

// mutate
const parseMutate = (response: OkPacket): T.MutateResponseInsert => {
  return {
    success: typeof response.insertId === "number",
    uuid: undefined,
    id: response.insertId,
    status: response.message,
  };
};

export const mutate = async (
  mq: T.Mutate,
  entities: T.Entity[],
  s: Connection.SQL
) => {
  const qs = MutateService.createMutateQuery(mq, entities);
  const [response] = await s.execQuery(qs.join("\n"));

  return parseMutate(response as OkPacket);
};
