import * as Connection from "./connection";
import { entities } from "./model";
import * as T from "./type";
import * as SQL from "./sql";
import * as U from "./utils";
import { OkPacket, RowDataPacket } from "mysql2";

const handleReponseUnit = (
  x: any[],
  qsi: T.SQuery
): {
  [k: string]: any;
}[] => {
  if (Array.isArray(x)) {
    const { projection, joins } = qsi;

    const fieldsWithValue = x.map((y) => {
      const r: { [k: string]: any } = {};

      projection.forEach((f) => (r[f.name] = y[f.column]));

      // to be reviewed
      hJoins(joins, qsi.entity, r, y);

      return r;
    });

    return fieldsWithValue;
  }

  throw Error("expecting an array");
};

const hJoins = (
  joins: T.Join[],
  parentType: string,
  r: {
    [k: string]: any;
  },
  y: {
    [k: string]: any;
  }
) => {
  const fs = joins.filter((x) => parentType === x.parent.name);

  fs.forEach((join) => {
    // alias
    r[join.field.name] = {};
    const k = r[join.field.name];

    if (join.pFields) {
      join.pFields.forEach((field) => {
        //const key = "j" + tIdx + "_" + field.column;
        const key = U.entityToTable(join.entity) + "_" + field.column;
        k[field.name] = y[key];
      });
    }

    hJoins(joins, join.field.type, k, y);
  });
};

const isRawDataPacket = (
  response: RowDataPacket[] | RowDataPacket
): response is RowDataPacket =>
  response.length > 0 && !Array.isArray(response[0]);

const handleReponse = (
  response: RowDataPacket[] | RowDataPacket,
  qs: T.SQuery[]
): any => {
  if (!Array.isArray(response)) {
    throw Error("not an array");
  }

  // in case we requested only one query, the response is a single array, we call the function recursively to be able to handle it
  if (isRawDataPacket(response)) {
    return handleReponse([response], qs);
  }

  const responseParsed = response.map((x: any, i: number) =>
    handleReponseUnit(x, qs[i])
  );

  const responseWithEntites: { [entity: string]: any } = {};

  responseParsed.forEach((responseEntity, i) => {
    responseWithEntites[qs[i].entity] = responseEntity;
  });

  return responseWithEntites;
};

export const exec = async (mq: T.Query, s: Connection.SQL) => {
  const qs = SQL.createQuery(mq, entities);

  // here we cast to RowDataPacket[] but theoreticfally it can also be RowDataPacket, it is checked downstream
  const response = await s.execQuery<RowDataPacket[]>(
    qs.map((x) => x.query).join("\n")
  );

  return handleReponse(response, qs);
};

export const execWithTime = async (query: T.Query, s: Connection.SQL) => {
  //
  const t1 = new Date().getTime();
  const r = await exec(query, s);
  const t2 = new Date().getTime();
  console.log(`delta ${t2 - t1}`);
  //console.log(r);
  return r;
  //
};

const parseMutate = (response: OkPacket): T.MutateResponseInsert => {
  return {
    success: typeof response.insertId === "number",
    uuid: undefined,
    id: response.insertId,
    status: response.message,
  };
};

export const mutate = async (mq: T.Mutate, s: Connection.SQL) => {
  const qs = SQL.createMutateQuery(mq, entities);
  const response = await s.execQuery<OkPacket>(qs.join("\n"));

  return parseMutate(response);
};
