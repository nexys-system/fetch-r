import * as SqlString from "sqlstring";
import * as T from "./type.js";

export const types: T.Type[] = [
  "String",
  "Int",
  "Long",
  "Boolean",
  "BigDecimal",
  "Float",
  "Double",
  "LocalDate",
  "LocalDateTime",
  "LocalTime",
  "JSON",
];

export const isStandardType = (t: string): t is T.Type =>
  types.includes(t as T.Type);

// see for a discussion on quotes https://stackoverflow.com/questions/11321491/when-to-use-single-quotes-double-quotes-and-backticks-in-mysql
export const escape = (v: any): string => {
  if (Array.isArray(v)) {
    const s = v.map((x) => escape(x)).join(",");

    return `(${s})`;
  }
  return SqlString.escape(v);
};

export const entityToTable = (
  entity: Pick<T.Entity, "name" | "table">
): string => entity.table || camelToSnakeCase(entity.name);

export const fieldToColumn = (
  field: Pick<T.Field, "name" | "column">
): string => field.column || camelToSnakeCase(field.name);

export const findField = (
  modelUnit: Pick<T.Entity, "name" | "uuid" | "fields">,
  fieldName: string
): { name: string; column: string; type: string; optional: boolean } => {
  if (fieldName === "id" && !modelUnit.uuid) {
    return { name: "id", column: "id", type: "Long", optional: false };
  }

  if (fieldName === "uuid" && modelUnit.uuid) {
    return { name: "uuid", column: "uuid", type: "String", optional: false };
  }
  const field = modelUnit.fields.find((x) => x.name === fieldName);

  if (!field) {
    throw Error("field could not be found:" + modelUnit.name + ":" + fieldName);
  }

  const column = fieldToColumn(field);

  return {
    name: field.name,
    column,
    type: field.type,
    optional: field.optional,
  };
};

// taken from https://github.com/Nexysweb/utils/blob/7a2aa1ab6ce29b6b079fd77eebec5af2201611ae/src/string.ts#L208
export const camelToSnakeCase = (str: string): string =>
  str.replace(/([a-z1-9])\.?(?=[A-Z]+)/g, "$1_").toLowerCase();

// taken from https://github.com/Nexysweb/utils/blob/7a2aa1ab6ce29b6b079fd77eebec5af2201611ae/src/array.ts#L303
export function arrayNotEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}
