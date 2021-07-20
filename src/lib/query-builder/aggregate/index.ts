// very first version
import * as T from "./type";
import { camelToSnakeCase } from "@nexys/utils/dist/string";
import { Entity, Field } from "../../type";
import * as U from "./utils";
import { SQL } from "../../database/connection";
import { getFilterString } from "../utils";

const idField: Field = {
  name: "id",
  type: "number",
  column: "id",
  optional: false,
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
  });

export const exec = (query: T.Query, model: Entity[], s: SQL) => {
  const [sql] = toSQL(query, model);
  return s.execQuery(sql);
};
