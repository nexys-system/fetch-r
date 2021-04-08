import * as TT from "./type";
import * as U from "../utils";
import * as UU from "./utils";
import NUtils from "@nexys/utils";

export const toQuery = (meta: TT.MetaQuery): string[] => {
  const projection: string = meta.units
    .map((x) =>
      x.fields
        .map(
          (y) =>
            `${x.alias}.\`${y.column}\` AS ${UU.getAliasColumn(
              x.alias,
              y.name
            )}`
        )
        .join(", ")
    )
    .join(", ");
  const filters: string[] = meta.units
    .map((x, i) => {
      if (x.filters.length === 0) {
        return;
      }
      return x.filters
        .map((y) => `t${i}.\`${y.column}\`=${U.escape(y.value)}`)
        .join(" AND ");
    })
    .filter(NUtils.array.notEmpty);

  const joins: string[] = meta.units.slice(1).map((x) => {
    const alias = x.alias;
    const parentAlias = meta.units.findIndex(
      (m) => m.entity === x.join?.entity
    );
    return (
      (x.join?.field.optional ? "LEFT " : "") +
      `JOIN ${x.table} AS ${alias} ON ${alias}.id=t${parentAlias}.${x.join?.field.column}`
    );
  });

  const r = [
    "SELECT " + projection,
    "FROM " + meta.units[0].table + " AS " + meta.units[0].alias,
  ];

  joins.forEach((join) => r.push(join));
  r.push("WHERE " + (filters.length === 0 ? "1" : filters.join(" AND ")));

  if (meta.order) {
    r.push(UU.getOrderStatement(meta.order));
  }

  const limitStatement = UU.getLimitStatement(meta);
  if (limitStatement) {
    r.push(limitStatement);
  }

  return r;
};
