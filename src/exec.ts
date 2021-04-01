import * as Connection from "./connection";
import { entities } from "./model";
import * as T from "./type";
import * as SQL from "./sql";

export const exec = async (mq: T.Query, s: Connection.SQL) => {
  const qs = SQL.createQuery(mq, entities);

  const q = await s.execQuery(qs.map((x) => x.query).join("\n"));
  console.log(q);

  if (!Array.isArray(q)) {
    throw Error("not an array");
  }

  //console.log(q);

  const responseParsed = q.map((x: any, i: number) => {
    if (Array.isArray(x)) {
      const { projection, joins } = qs[i];

      const fieldsWithValue = x.map((y) => {
        const r: { [k: string]: any } = {};

        projection.forEach((f) => {
          r[f.name] = y[f.column];
        });

        joins.forEach((join, tIdx) => {
          r[join.field.name] = {};
          // alias
          const j = r[join.field.name];

          if (join.pFields) {
            join.pFields.forEach((field) => {
              const key = "j" + tIdx + "_" + field.column;
              j[field.name] = y[key];
            });
          }
        });

        return r;
      });

      return fieldsWithValue;
      //console.log({ x, id: x[0].id, i, e: qs[i] });
    }

    throw Error("expecting an array");
  });

  const responseWithEntites: { [entity: string]: any } = {};

  responseParsed.forEach((responseEntity, i) => {
    responseWithEntites[qs[i].entity] = responseEntity;
  });

  return responseWithEntites;
};
