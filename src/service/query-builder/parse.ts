/**
 * the system receives a query,
 * the query is transformed into a (linear) meta query,
 * the meta query is transformed into MySQL (or any SQL-like system, grammar to be adjusted)
 * teh result of the query is parsed
 */
import * as TT from "./type";
import * as UU from "./utils";
import { RowDataPacket } from "mysql2";

export const parseUnit = (x: RowDataPacket, meta: TT.MetaQueryUnit[]) => {
  const hJoins = (m: TT.MetaQueryUnit): { [col: string]: any } => {
    const r: { [col: string]: any } = {};

    m.fields.forEach((f) => {
      const aliasName = UU.getAliasColumn(m.alias, f.name);
      r[f.name] = x[aliasName];
    });

    // to account for "LEFT JOINS"
    if (r["id"] === null) {
      return null as any;
    }

    return r;
  };

  const recur = (
    parentEntity: string,
    alias: string,
    r: { [col: string]: any }
  ) =>
    meta
      .filter((x) => x.join?.entity === parentEntity && alias !== x.alias)
      .forEach((m) => {
        if (m.join) {
          const attrName = m.join.field.name;
          r[attrName] = {};
          r[attrName] = hJoins(m);
          recur(m.entity, m.alias, r[attrName]);
        }
      });

  const [m]: TT.MetaQueryUnit[] = meta;

  const r: { [col: string]: any } = hJoins(m);
  recur(m.entity, m.alias, r);

  return r;
};

export const parse = (x: RowDataPacket, meta: TT.MetaQueryUnit[]) => {
  if (!Array.isArray(x)) {
    throw Error("expecting an array");
  }
  return x.map((y) => parseUnit(y, meta));
};
