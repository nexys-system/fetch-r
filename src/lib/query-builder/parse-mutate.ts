import { OkPacket } from "mysql2";
import * as T from "../type";

export const parseMutateInsert = (
  response: OkPacket
): T.MutateResponseInsert | T.MutateResponseInsert[] => {
  const { affectedRows, insertId, message } = response;
  const success = typeof response.insertId === "number";

  if (affectedRows > 1) {
    // insert multiple
    return new Array(affectedRows).fill(insertId).map((_x, i) => {
      return {
        success,
        uuid: undefined,
        id: insertId + i,
        status: message,
      };
    });
  }

  return {
    success,
    uuid: undefined,
    id: insertId,
    status: message,
  };
};

const parseMutateUpdate = (response: OkPacket): T.MutateResponseUpdate => ({
  success: typeof response.insertId === "number",
  updated: response.affectedRows,
});

const parseMutateDelete = (response: OkPacket): T.MutateResponseDelete => ({
  success: typeof response.insertId === "number",
  deleted: response.affectedRows,
});

const getResultBasedOnType = (t: T.MutateType, response: OkPacket) => {
  console.log(response);
  switch (t) {
    case T.MutateType.insert:
      return { insert: parseMutateInsert(response) };
    case T.MutateType.update:
      return { update: parseMutateUpdate(response) };
    case T.MutateType.delete:
      return { delete: parseMutateDelete(response) };
  }
};

export const parseMutate = (
  qs: { type: T.MutateType; entity: T.Entity }[],
  response: OkPacket
): T.MutateResponse => {
  const r: T.MutateResponse = {};

  qs.forEach(({ entity, type }) => {
    r[entity.name] = getResultBasedOnType(type, response);
  });

  return r;
};
