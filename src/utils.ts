import NUtils from "@nexys/utils";
import * as T from "./type";

export const types: T.Type[] = [
  "String",
  "Int",
  "Boolean",
  "BigDecimal",
  "Float",
  "LocalDate",
  "LocalDateTime",
  "LocalTime",
];

export const isStandardType = (t: string): t is T.Type =>
  types.includes(t as T.Type);

export const escape = (v: any): string | number => {
  switch (typeof v) {
    case "number":
      return v;
    case "string":
      return '"' + v.replace(/"/g, '\\"') + '"';
    default:
      return escape(String(v));
  }
};

export const entityToTable = (
  entity: Pick<T.Entity, "name" | "table">
): string => entity.table || NUtils.string.camelToSnakeCase(entity.name);
