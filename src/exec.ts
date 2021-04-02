import * as Connection from "./connection";
import { entities } from "./model";
import * as T from "./type";
import * as SQL from "./sql";
import * as U from "./utils";

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

      projection.forEach((f) => {
        console.log("her1e");
        console.log(f);
        r[f.name] = y[f.column];
      });

      // to be reviewed
      joins
        .filter((join) => join.parent.name === qsi.entity)
        .forEach((join) => {
          r[join.field.name] = {};
          // alias
          console.log("here");
          console.log(join.field.name);
          //console.log(join, qsi.entity);
          const j = r[join.field.name];

          if (join.pFields) {
            join.pFields.forEach((field) => {
              //const key = "j" + tIdx + "_" + field.column;
              const key = U.entityToTable(join.entity) + "_" + field.column;
              j[field.name] = y[key];
            });
          }

          const fs = joins.filter((x) => join.field.type === x.parent.name);
          if (fs.length > 0) {
            fs.forEach((join) => {
              // alias
              j[join.field.name] = {};
              const k = j[join.field.name];

              if (join.pFields) {
                join.pFields.forEach((field) => {
                  //const key = "j" + tIdx + "_" + field.column;
                  const key = U.entityToTable(join.entity) + "_" + field.column;
                  k[field.name] = y[key];
                });
              }
            });

            //
          }
        });

      return r;
    });

    return fieldsWithValue;
  }

  throw Error("expecting an array");
};

const handleReponse = (response: any, qs: T.SQuery[]): any => {
  if (!Array.isArray(response)) {
    throw Error("not an array");
  }

  // in case we requested only one query, the response is a single array, we call the function recursively to be able to handle it
  if (response.length > 0 && !Array.isArray(response[0])) {
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

  const response = await s.execQuery(qs.map((x) => x.query).join("\n"));

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
