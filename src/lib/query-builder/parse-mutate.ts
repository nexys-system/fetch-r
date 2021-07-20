import { OkPacket, RowDataPacket } from "mysql2";
import { Connection } from "..";
import * as T from "../type";
import { entityToTable } from "../utils";

export const getIdsMutateInsert = ({
  affectedRows,
  insertId,
}: OkPacket): number[] => {
  // insert multiple
  if (affectedRows > 0) {
    const ids: number[] = new Array(affectedRows)
      .fill(insertId)
      .map((_x, i) => insertId + i);

    return ids.map((_x, i) => insertId + i);
  }

  throw Error("no rows affected");
};

const idsToResponseInsert = (
  { insertId, message }: OkPacket,
  id?: number,
  uuid?: string
): T.MutateResponseInsert => ({
  success: typeof insertId === "number",
  uuid,
  id,
  status: message,
});

export const parseMutateInsert = async (
  response: OkPacket,
  entity: T.Entity,
  s: Connection.SQL,
  isInsertMultiple: boolean
): Promise<T.MutateResponseInsert | T.MutateResponseInsert[]> => {
  //const { affectedRows } = response;

  const { uuid } = entity;

  const ids: number[] = getIdsMutateInsert(response);

  // special case for uuids
  if (uuid) {
    const sql = `SELECT uuid FROM ${entityToTable(
      entity
    )} WHERE id IN (${ids.join(", ")})`;

    const [responseUuid] = (await s.execQuery(sql)) as any as [RowDataPacket];

    const uuids: string[] = responseUuid.map(
      (d: { uuid: string }) => d["uuid"]
    );

    if (isInsertMultiple) {
      return uuids.map((uuid) =>
        idsToResponseInsert(response, undefined, uuid)
      );
    }

    return idsToResponseInsert(response, undefined, uuids[0]);
  }

  if (isInsertMultiple) {
    return ids.map((id) => idsToResponseInsert(response, id));
  }

  return idsToResponseInsert(response, ids[0]);
};

const parseMutateUpdate = (response: OkPacket): T.MutateResponseUpdate => ({
  success: typeof response.insertId === "number",
  updated: response.affectedRows,
});

const parseMutateDelete = (response: OkPacket): T.MutateResponseDelete => ({
  success: typeof response.insertId === "number",
  deleted: response.affectedRows,
});

const getResultBasedOnType = async (
  t: T.MutateType,
  response: OkPacket,
  entity: T.Entity,
  s: Connection.SQL
) => {
  //console.log(response);
  switch (t) {
    case T.MutateType.insertMultiple:
      return { insert: await parseMutateInsert(response, entity, s, true) };
    case T.MutateType.insert:
      return { insert: await parseMutateInsert(response, entity, s, false) };
    case T.MutateType.update:
      return { update: parseMutateUpdate(response) };
    case T.MutateType.delete:
      return { delete: parseMutateDelete(response) };
  }
};

export const parseMutate = async (
  qs: { type: T.MutateType; entity: T.Entity }[],
  response: OkPacket,
  s: Connection.SQL
): Promise<T.MutateResponse> => {
  const r: T.MutateResponse = {};

  const pqs = qs.map(async ({ entity, type }) => {
    r[entity.name] = await getResultBasedOnType(type, response, entity, s);
    return true;
  });

  await Promise.all(pqs);

  return r;
};