import NUtils from "@nexys/utils";
import { getModel } from "./utils";
import * as T from "../type";
import * as U from "../utils";

// SQL

const getFilters = (modelUnit: T.Entity, filters?: T.QueryFilters): string => {
  if (!filters) {
    return "1";
  }

  return Object.entries(filters)
    .map(([col, value]) => {
      const field = U.findField(modelUnit, col);

      return `\`${field.column}\`=${U.escape(value)}`;
    })
    .join(" AND ");
};

/**
 * generates SQL queries (goes through the different queries)
 * @param params
 * @param modelUnit
 * @param model
 * @returns
 */

const getValuesInsert = (data: any, fields: T.Field[], model: T.Entity[]) => {
  const v = fields
    .map((x) => {
      const v = data[x.name];
      if (!U.isStandardType(x.type)) {
        const entity = getModel(x.type, model);

        const idUuid = entity.uuid ? "uuid" : "id";
        const w = entity.uuid ? U.escape(v.uuid) : Number(v.id);

        // the code can be stopped here for ID
        /*
        if (!entity.uuid) {
          return w;
        }*/

        const table = U.entityToTable(entity);

        return `(SELECT id FROM \`${table}\` WHERE ${idUuid}=${w})`;
      }

      switch (x.type) {
        case "LocalDateTime":
          return U.escape(new Date(v).toISOString());
        default:
          return U.escape(v);
      }
    })
    .join(", ");

  return "(" + v + ")";
};

const getValuesInsertMultiple = (
  data: any[],
  fields: T.Field[],
  model: T.Entity[]
) => data.map((d) => getValuesInsert(d, fields, model)).join(", ");

const toQueryInsert = (entity: T.Entity, data: any, model: T.Entity[]) => {
  const fields = entity.fields.map((x) => U.fieldToColumn(x)).join(", ");

  const values = Array.isArray(data)
    ? getValuesInsertMultiple(data, entity.fields, model)
    : getValuesInsert(data, entity.fields, model);
  return `INSERT INTO ${U.entityToTable(entity)} (${fields}) VALUES ${values};`;
};

const toQueryUpdate = (
  entity: T.Entity,
  data: any,
  filters: T.QueryFilters
) => {
  const filterString = getFilters(entity, filters);

  const values = Object.entries(data)
    .map(([k, v]) => {
      const field = entity.fields.find((x) => x.name === k);

      if (!field) {
        throw Error(`update: cannot find ${entity.name}.${k}`);
      }

      const col = U.fieldToColumn(field);

      return `${col}=${U.escape(v)}`;
    })
    .join(", ");
  return `UPDATE ${U.entityToTable(
    entity
  )} SET ${values} WHERE ${filterString};`;
};

const toQueryDelete = (
  entity: T.Entity,

  filters: T.QueryFilters
) => {
  const filterString = getFilters(entity, filters);

  return `DELETE FROM ${U.entityToTable(entity)} WHERE ${filterString};`;
};

export const createMutateQuery = (
  query: T.Mutate,
  model: T.Entity[]
): string[] =>
  Object.entries(query)
    .map(([entity, queryParams]) => {
      const modelEntity = getModel(entity, model);

      if (queryParams.insert) {
        return toQueryInsert(modelEntity, queryParams.insert.data, model);
      }

      if (queryParams.update) {
        return toQueryUpdate(
          modelEntity,
          queryParams.update.data,
          queryParams.update.filters
        );
      }

      if (queryParams.delete) {
        return toQueryDelete(modelEntity, queryParams.delete.filters);
      }

      return;
    })
    .filter(NUtils.array.notEmpty);
