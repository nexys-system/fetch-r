import * as T from "./type";
// very first version
// const q = {aggregate:{'userModule':true}, projection:{$count:['passed'], $sum: ['passed']}}

import { camelToSnakeCase } from "@nexys/utils/dist/string";
import { Entity } from "../../type";

const toSQLOperator = (input: T.AggregateOperator): T.SQLAggregatorOperator => {
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

export const toSQL = (q: T.Query, model: Entity[]) =>
  Object.entries(q).map(([entity, params]) => {
    const modelUnit = model.find((x) => x.name === entity);

    if (!modelUnit) {
      throw Error("AGGREGATE: could not find model unit");
    }

    const groupByFields: string[] = Object.entries(params.projection)
      .filter(([_field, value]) => {
        return typeof value === "boolean";
      })
      .map(([field, _value]) => {
        const fieldUnit = modelUnit.fields.find((y) => field === y.name);

        if (!fieldUnit) {
          throw Error("AGGREGATE: could not find field unit: " + field);
        }

        return fieldUnit.column || camelToSnakeCase(fieldUnit.name);
      });

    const groupsByStr = groupByFields.join(", ");

    const fieldStrings = Object.entries(params.projection)
      .map(([field, value]) => {
        const fieldUnit =
          modelUnit.fields.find((y) => field === y.name) ||
          (field === "id" && { name: "id", column: "id", optional: false });

        if (!fieldUnit) {
          throw Error("AGGREGATE: could not find field unit: " + field);
        }

        const column = fieldUnit.column || camelToSnakeCase(fieldUnit.name);

        return getOperator(column, value);
      })
      .join(", ");

    return `SELECT ${fieldStrings} FROM ${
      modelUnit.table || camelToSnakeCase(modelUnit.name)
    } GROUP BY ${groupsByStr}`;
  });

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
