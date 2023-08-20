// very first version
import * as T from "./type";

import { Entity, Field } from "../../type";
import * as U from "./utils";
import { SQL } from "../../database/connection";
import { getFilterString } from "../utils";
import { camelToSnakeCase } from "../../utils";

const idField: Field = {
  name: "id",
  type: "number",
  column: "id",
  optional: false,
};

export const toSQL = (entity: string, params: T.Params, model: Entity[]) => {
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

      return U.toColumn(fieldUnit);
    });

  const groupsByStr = groupByFields.join(", ");

  const fieldStrings = Object.entries(params.projection)
    .map(([field, value]) => {
      const fieldUnit =
        modelUnit.fields.find((y) => field === y.name) ||
        (field === "id" && idField);

      if (!fieldUnit) {
        throw Error("AGGREGATE: could not find field unit: " + field);
      }

      const column = U.toColumn(fieldUnit);

      return U.getOperator(column, value);
    })
    .join(", ");

  const filtersString = params.filters
    ? Object.entries(params.filters)
        .map(([field, v]) => {
          const fieldUnit =
            modelUnit.fields.find((y) => field === y.name) ||
            (field === "id" && idField);

          if (!fieldUnit) {
            throw Error("AGGREGATE: could not find field unit: " + field);
          }
          const column = U.toColumn(fieldUnit);
          const op = getFilterString(v as any);

          return column + op;
        })
        .join(" && ")
    : "1";

  return `SELECT ${fieldStrings} FROM ${
    modelUnit.table || camelToSnakeCase(modelUnit.name)
  } WHERE ${filtersString} GROUP BY ${groupsByStr}`;
};

export const exec = async (
  query: T.Query,
  model: Entity[],
  s: SQL
): Promise<T.ResponseAggregate> => {
  const r: T.ResponseAggregate = {};

  const p = Object.entries(query).map(async ([entity, params]) => {
    const sql = toSQL(entity, params, model);
    const response = await s.execQuery(sql);
    r[entity] = parse(response);
    return 1;
  });

  await Promise.all(p);

  return r;
};

// todo: parse output so the out arguments mathc the ones of the query
const parse = (x: any) => x;
