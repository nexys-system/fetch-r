import { RowDataPacket, OkPacket } from "mysql2";
import * as Connection from "./database/connection";
import * as T from "./type";
import * as Meta from "./query-builder/meta";
import * as MutateService from "./query-builder/mutate";
import * as TT from "./query-builder/type";
import * as Parse from "./query-builder/parse";
import * as ParseMutate from "./query-builder/parse-mutate";
import * as ReferenceService from "./query-builder/references";
import * as U from "./query-builder/utils";
import { DatabaseType } from "./database/type";

const isRawDataPacket = (
  response: RowDataPacket[] | RowDataPacket
): response is RowDataPacket =>
  response.length > 0 && !Array.isArray(response[0]);

const handleReponse = async (
  response: RowDataPacket[] | RowDataPacket,
  qs: TT.MetaQuery[],
  model: T.Entity[],
  s: Connection.SQL,
  databaseType: DatabaseType
): Promise<T.ReturnUnit> => {
  if (!Array.isArray(response)) {
    throw Error("not an array");
  }

  // in case we requested only one query, the response is a single array, we call the function recursively to be able to handle it
  if (isRawDataPacket(response)) {
    return handleReponse([response], qs, model, s, databaseType);
  }

  const pResponseParsed = response.map(
    async (responseUnit: RowDataPacket, metaIdx: number) => {
      const meta = qs[metaIdx];

      const main = Parse.parse(responseUnit, meta, databaseType);

      // if references are present
      // 1. get ids of parent result
      // 2 do query but filter for the ids that are relevant
      // 3 insert result into current result
      const { references } = meta;
      if (references) {
        await ReferenceService.prepare(
          meta,
          main,
          references,
          model,
          s,
          databaseType
        );
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
      // return an empty array
      responseWithEntites[m.entity] = [];
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
  databaseType: DatabaseType
  //options: {  } = { }
): Promise<T.ReturnUnit> => {
  const qs = Meta.createQuery(mq, entities, databaseType);

  const r = await execFromMeta(qs, entities, s, databaseType);

  // this is the last step before output, remove ids where not needed
  U.removeId(r);

  return r;
};

export const getSQLFromMeta = (
  qs: {
    sql: string;
    meta: TT.MetaQuery;
  }[]
): string => qs.map((x) => x.sql).join("\n");

export const getSQL = (
  mq: T.Query,
  entities: T.Entity[],
  databaseType: DatabaseType
) => {
  const qs = Meta.createQuery(mq, entities, databaseType);
  return getSQLFromMeta(qs);
};

export const execFromMeta = async (
  qs: {
    sql: string;
    meta: TT.MetaQuery;
  }[],
  entities: T.Entity[],
  s: Connection.SQL,
  databaseType: DatabaseType
): Promise<T.ReturnUnit> => {
  const sqlScript = getSQLFromMeta(qs);

  // here we cast to RowDataPacket[] but theoretically it can also be RowDataPacket, it is checked downstream
  // raw response
  const response = await s.execQuery(sqlScript);

  return handleReponse(
    response as RowDataPacket,
    qs.map((x) => x.meta),
    entities,
    s,
    databaseType
  );
};

export const getSQLMutate = (
  mq: T.Mutate,
  entities: T.Entity[],
  databaseType: DatabaseType
): string => {
  const qs = MutateService.createMutateQuery(mq, entities, databaseType);
  return qs.map((x) => x.sql).join("\n");
};

export const mutate = async <A = any>(
  mq: T.Mutate<A>,
  entities: T.Entity[],
  s: Connection.SQL,
  databaseType: DatabaseType
): Promise<T.MutateResponse> => {
  const qs = MutateService.createMutateQuery(mq, entities, databaseType);
  // console.log(qs.map((x) => x.sql).join("\n"));
  const response = await s.execQuery(qs.map((x) => x.sql).join("\n"));

  if (databaseType === "PostgreSQL") {
    return response as any;
  }

  return await ParseMutate.parseMutate(qs, response as OkPacket, s);
};
