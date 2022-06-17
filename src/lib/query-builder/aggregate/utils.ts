import { Field } from "../../type";
import { camelToSnakeCase } from "../../utils";
import * as T from "./type";

export const toSQLOperator = (
  input: T.AggregateOperator
): T.SQLAggregatorOperator => {
  switch (input) {
    case "$count":
      return "COUNT";
    case "$sum":
      return "SUM";
    case "$avg":
      return "AVG";
    case "$min":
      return "MIN";
    case "$max":
      return "MAX";
  }
};

export const getOperator = (
  column: string,
  value:
    | boolean
    | {
        $aggregate:
          | T.AggregateOperator
          | { [alias: string]: T.AggregateOperator };
      }
): string => {
  if (typeof value === "boolean") {
    return column;
  }

  const agg = value.$aggregate;

  if (typeof agg === "string") {
    const alias: string = agg.slice(1) + "_" + column;
    return getOperatorUnit(agg, column, alias);
  }

  return Object.entries(agg)
    .map(([alias, operator]) => getOperatorUnit(operator, column, alias))
    .join(", ");
};

export const getOperatorUnit = (
  operator: T.AggregateOperator,
  column: string,
  alias: string
) => toSQLOperator(operator) + `(${column}) as ${alias}`;

export const toColumn = (field: Field) =>
  field.column || camelToSnakeCase(field.name);
