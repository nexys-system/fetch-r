// very first version
import * as T from "./type.js";

import { Entity, Field } from "../../type.js";
import * as U from "./utils.js";
import { SQL } from "../../database/connection.js";
import { getFilterString } from "../utils.js";
import { camelToSnakeCase, isStandardType } from "../../utils.js";

const idField: Field = {
  name: "id",
  type: "number",
  column: "id",
  optional: false,
};

const isNestedFilter = (value: any): boolean => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  // Check if all keys are filter operators (start with $)
  const keys = Object.keys(value);
  return keys.length > 0 && !keys.every((k) => k.startsWith("$"));
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

  // Collect JOINs and filter conditions
  const joins: string[] = [];
  const filterConditions: string[] = [];

  if (params.filters) {
    Object.entries(params.filters).forEach(([field, v]) => {
      const fieldUnit =
        modelUnit.fields.find((y) => field === y.name) ||
        (field === "id" && idField);

      if (!fieldUnit) {
        throw Error("AGGREGATE: could not find field unit: " + field);
      }

      // Check if this is a nested filter (filter on FK field's attributes)
      if (!isStandardType(fieldUnit.type) && isNestedFilter(v)) {
        // This is a FK field with nested filters
        const relatedModel = model.find((m) => m.name === fieldUnit.type);
        if (!relatedModel) {
          throw Error(`AGGREGATE: could not find related model: ${fieldUnit.type}`);
        }

        const mainTable = modelUnit.table || camelToSnakeCase(modelUnit.name);
        const relatedTable = relatedModel.table || camelToSnakeCase(relatedModel.name);
        const fkColumn = U.toColumn(fieldUnit);

        // Add JOIN
        joins.push(`JOIN ${relatedTable} ON ${relatedTable}.id=${mainTable}.${fkColumn}`);

        // Process nested filters
        Object.entries(v as Record<string, any>).forEach(([nestedField, nestedValue]) => {
          const nestedFieldUnit = relatedModel.fields.find((f) => f.name === nestedField);
          if (!nestedFieldUnit) {
            throw Error(`AGGREGATE: could not find nested field: ${nestedField} in ${fieldUnit.type}`);
          }

          const nestedColumn = `${relatedTable}.${U.toColumn(nestedFieldUnit)}`;
          const op = getFilterString(nestedValue);
          filterConditions.push(nestedColumn + op);
        });
      } else {
        // Standard filter on current entity's field
        const column = U.toColumn(fieldUnit);
        const op = getFilterString(v as any);
        filterConditions.push(column + op);
      }
    });
  }

  const filtersString = filterConditions.length > 0 ? filterConditions.join(" AND ") : "1";
  const joinsString = joins.length > 0 ? " " + joins.join(" ") : "";
  const mainTable = modelUnit.table || camelToSnakeCase(modelUnit.name);

  return `SELECT ${fieldStrings} FROM ${mainTable}${joinsString} WHERE ${filtersString} GROUP BY ${groupsByStr}`;
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
