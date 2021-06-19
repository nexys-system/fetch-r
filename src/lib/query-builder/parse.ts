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
  const hJoins = (m: TT.MetaQueryUnit): T.ReturnUnit | null => {
    const r: T.ReturnUnit = {};

    m.fields.forEach((f) => {
      const aliasName = UU.getAliasColumn(m.alias, f.name);
      r[f.name] = x[aliasName];
    });

    // to account for "LEFT JOINS" / optional dependencies
    if (r["id"] === null) {
      return null;
    }

    aliases.push(m.alias);

    return r;
  };

  const recur = (parentEntity: string, alias: string, r: T.ReturnUnit) =>
    meta
      .filter(
        (x) => x.join?.entity === parentEntity && alias !== x.alias //&&
        // !aliases.includes(x.alias)
      )
      .forEach((m) => {
        if (m.join) {
          const attrName = m.join.field.name;
          r[attrName] = {};
          r[attrName] = hJoins(m);
          recur(m.entity, m.alias, r[attrName]);
        }
      });

  // store already "used" aliases
  const aliases: string[] = [];

  // get first entry (main entity)
  const [m]: TT.MetaQueryUnit[] = meta;

  const r: T.ReturnUnit | null = hJoins(m);
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
