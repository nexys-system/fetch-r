import * as TT from "./type";
import * as U from "../utils";
import * as UU from "./utils";
import { DatabaseType } from "../database/type";

export const toQuery = (
  meta: TT.MetaQuery,
  databaseType: DatabaseType
): string[] => {
  const columnEscaper = databaseType === "MySQL" ? "`" : '"';

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
            `t${i}.\`${y.column}\`` +
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
  // add backticks if the table contains weird symbols, ideally it should alwasy be here but tests need to be fixed
  const tableEscaped = table.includes("-") ? "`" + table + "`" : table;

  const r = [
    "SELECT " + projection,
    "FROM " + tableEscaped + " AS " + meta.units[0].alias,
  ];

  // in MySQL: WHERE 1 , postgres: WHERE true
  const wherePlaceholder = databaseType === "MySQL" ? "1" : "true";

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
