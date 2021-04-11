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
  if (Array.isArray(v)) {
    const s = v.map((x) => escape(x)).join(",");

    return `(${s})`;
  }
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

export const fieldToColumn = (
  field: Pick<T.Field, "name" | "column">
): string => field.column || NUtils.string.camelToSnakeCase(field.name);

export const findField = (
  modelUnit: Pick<T.Entity, "name" | "uuid" | "fields">,
  fieldName: string
): { name: string; column: string } => {
  if (fieldName === "id" && !modelUnit.uuid) {
    return { name: "id", column: "id" };
  }

  if (fieldName === "uuid" && modelUnit.uuid) {
    return { name: "uuid", column: "uuid" };
  }
  const field = modelUnit.fields.find((x) => x.name === fieldName);

  if (!field) {
    throw Error("field could not be found:" + modelUnit.name + ":" + fieldName);
  }

  const column = fieldToColumn(field);

  return { name: field.name, column };
};