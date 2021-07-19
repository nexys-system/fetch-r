/**
 * the system receives a query,
 * the query is transformed into a (linear) meta query,
 * the meta query is transformed into MySQL (or any SQL-like system, grammar to be adjusted)
 * the result of the query is parsed
 *
 * this file handles the parsing
 */
import * as T from "../type";
import * as TT from "./type";
import * as UU from "./utils";
import { RowDataPacket } from "mysql2";

export const parseUnit = (
  x: RowDataPacket,
  meta: TT.MetaQueryUnit[]
): T.ReturnUnit => {
  /**
   * add the projection values
   * @param m meta
   * @returns
   */
  const applyProjection = (m: TT.MetaQueryUnit): T.ReturnUnit | null => {
    const r: T.ReturnUnit = {};

    m.fields.forEach((f) => {
      const aliasName = UU.getAliasColumn(m.alias, f.name);

      r[f.name] = x[aliasName];
    });

    // to account for "LEFT JOINS" / optional dependencies
    if (r["id"] === null) {
      return null;
    }

    return r;
  };

  const recur = (parentEntity: string, alias: string, r: T.ReturnUnit) =>
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
      .filter((x) => x.join?.entity === parentEntity && alias < x.alias)
      .forEach((m) => {
        if (m.join) {
          const attrName = m.join.field.name;
          //console.log(attrName, r[attrName], r);
          r[attrName] = {};
          r[attrName] = applyProjection(m);
          // console.log(r[attrName]);

          if (r[attrName] !== null) {
            recur(m.entity, m.alias, r[attrName]);
          }
        }
      });

  // get first entry (main entity)
  const [m]: TT.MetaQueryUnit[] = meta;

  const r: T.ReturnUnit | null = applyProjection(m);

  if (r) {
    recur(m.entity, m.alias, r);
  }

  return r as T.ReturnUnit; // here explicitly rule out `null` via type casting, more elegant way?
};

export const parse = (x: RowDataPacket, meta: TT.MetaQuery): T.ReturnUnit[] => {
  if (!Array.isArray(x)) {
    throw Error("expecting an array");
  }

  const mainResult = x.map((y) => parseUnit(y, meta.units));

  return mainResult;
};
