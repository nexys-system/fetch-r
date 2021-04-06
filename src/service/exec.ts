import * as Connection from "./connection";
import * as T from "./type";

import * as Meta from "./query-builder/meta";
import * as TT from "./query-builder/type";
import { RowDataPacket } from "mysql2";

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
    Meta.parse(x, qs[i])
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

  // here we cast to RowDataPacket[] but theoreticfally it can also be RowDataPacket, it is checked downstream
  const response = await s.execQuery<RowDataPacket[]>(sqlScript);

  return handleReponse(
    response,
    qs.map((x) => x.meta)
  );
};