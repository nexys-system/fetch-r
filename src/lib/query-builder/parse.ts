/**
 * the system receives a query,
 * the query is transformed into a (linear) meta query,
 * the meta query is transformed into MySQL (or any SQL-like system, grammar to be adjusted)
 * the result of the query is parsed
 *
 * this file handles the parsing
 */
import { DatabaseType } from "../database/type";
import * as T from "../type";
import * as TT from "./type";
import * as UU from "./utils";
import { RowDataPacket } from "mysql2";

/**
 * parse to the right javascript value
 * typically relevant for boolean. MySql does not have boolean types and returns [0,1+]
 * @see https://www.mysqltutorial.org/mysql-boolean/
 * @see https://dba.stackexchange.com/questions/12569/how-to-cast-an-integer-to-a-boolean-in-a-mysql-select-clause
 */
export const getParsedValue = (
  x: RowDataPacket,
  aliasName: string,
  type?: T.Type
) => {
  // get value
  const v = x[aliasName];
  // console.log({ v, aliasName, type, t: typeof v, in: v instanceof Date });

  // if expected type is boolean and returned type is number, cast to boolean
  if (type && type === "Boolean" && typeof v === "number") {
    return Boolean(v > 0); // note that false == 0 and true is any positive integer
  }

  // if date, explicitly turn to JSON
  if (typeof v === "object" && v instanceof Date) {
    return v.toJSON();
  }

  return v;
};

export const parseUnit = (
  x: RowDataPacket,
  meta: TT.MetaQueryUnit[],
  databaseType: DatabaseType
): T.ReturnUnit => {
  /**
   * add the projection values
   * @param m meta
   * @returns
   */
  const applyProjection = (m: TT.MetaQueryUnit): T.ReturnUnit | null => {
    const r: T.ReturnUnit = {};

    m.fields.forEach((f) => {
      let aliasName = UU.getAliasColumn(m.alias, f.name);

      if (databaseType === "PostgreSQL") {
        aliasName = aliasName.toLowerCase();
      }

      r[f.name] = getParsedValue(x, aliasName, f.type);
    });

    // to account for "LEFT JOINS" / optional dependencies
    if (r["id"] === null) {
      return null;
    }

    return r;
  };

  const recur = (
    parentEntity: string,
    entityRef: TT.EntityRef,
    r: T.ReturnUnit
  ) =>
    meta
      // get all the meta units that are linked with the observed/parent one.
      // we filter on:
      // - child entity = parent entity
      // - child alias needs to be greater than parent. This comes from the construction of the meta units and how they translate to SQL code. Eery unit is a SQL Join and hence is read only once fron top to bottom. Since alias are t_i we can apply the ">" operator and make sure we dont get trapped in an infinite loop
      // consider
      // {
      //  "User": {
      //    "projection": {
      //      "country":{},
      //      "company":{"logUser":{}}
      //    },
      //    "take": 2
      //  }
      // }
      .filter((x) => UU.findUnit(x, { entity: parentEntity, idx: entityRef }))
      .forEach((m) => {
        if (m.join) {
          const attrName = m.join.field.name;
          //console.log(attrName, r[attrName], r);
          r[attrName] = {};
          r[attrName] = applyProjection(m);
          // console.log(r[attrName]);

          if (r[attrName] !== null) {
            recur(m.entity, m.idx, r[attrName]);
          }
        }
      });

  // get first entry (main entity)
  const [m]: TT.MetaQueryUnit[] = meta;

  const r: T.ReturnUnit | null = applyProjection(m);

  if (r) {
    recur(m.entity, m.idx, r);
  }

  return r as T.ReturnUnit; // here explicitly rule out `null` via type casting, more elegant way?
};

export const parse = (
  x: RowDataPacket,
  meta: TT.MetaQuery,
  databaseType: DatabaseType
): T.ReturnUnit[] => {
  if (!Array.isArray(x)) {
    throw Error("expecting an array");
  }

  return x.map((y) => parseUnit(y, meta.units, databaseType));
};
