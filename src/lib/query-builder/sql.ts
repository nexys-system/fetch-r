import * as TT from "./type.js";
import * as U from "../utils.js";
import * as UU from "./utils.js";
import { DatabaseType } from "../database/type.js";

export const toQuery = (
  meta: TT.MetaQuery,
  databaseType: DatabaseType
): string[] => {
  const columnEscaper =
    databaseType === "MySQL" || databaseType === "SQLite" ? "`" : '"';

  const projection: string = meta.units
    .map((x) =>
      x.fields
        .map(
          (y) =>
            `${x.alias}.${columnEscaper}${
              y.column
            }${columnEscaper} AS ${UU.getAliasColumn(x.alias, y.name)}`
        )
        .join(", ")
    )
    .filter(U.arrayNotEmpty)
    .join(", ");

  const filters: string[] = meta.units
    .map((x, i) => {
      if (x.filters.length === 0) {
        return;
      }

      return x.filters
        .map(
          (y) =>
            `t${i}.${columnEscaper}${y.column}${columnEscaper}` +
            UU.toSQLOperator(y.operator, y.value) +
            U.escape(y.value)
        )
        .join(" AND ");
    })
    .filter(U.arrayNotEmpty);

  const joins: string[] = meta.units.slice(1).map((x) => {
    const parentAlias = meta.units.findIndex((m) => UU.findUnit(x, m));

    return (
      (x.join?.field.optional ? "LEFT " : "") +
      `JOIN ${x.table} AS ${x.alias} ON ${x.alias}.id=t${parentAlias}.${x.join?.field.column}`
    );
  });

  const { table } = meta.units[0];
  // add appropriate escaping for SQLite and other databases
  const tableEscaped =
    databaseType === "MySQL" || databaseType === "SQLite"
      ? table.includes("-")
        ? "`" + table + "`"
        : table
      : `"${table}"`;

  const r = [
    "SELECT " + projection,
    "FROM " + tableEscaped + " AS " + meta.units[0].alias,
  ];

  // in MySQL and SQLite: WHERE 1 , postgres: WHERE true
  const wherePlaceholder = databaseType === "PostgreSQL" ? "true" : "1";

  joins.forEach((join) => r.push(join));
  r.push(
    "WHERE " + (filters.length === 0 ? wherePlaceholder : filters.join(" AND "))
  );

  if (meta.order) {
    r.push(UU.prepareOrderStatement(meta));
  }

  const limitStatement = UU.getLimitStatement(meta, databaseType);
  if (limitStatement) {
    r.push(limitStatement);
  }

  return r;
};
