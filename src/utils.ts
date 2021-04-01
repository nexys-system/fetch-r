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
