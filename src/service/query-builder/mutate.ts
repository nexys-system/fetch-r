import NUtils from "@nexys/utils";
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

const getValuesInsert = (data: any, fields: T.Field[]) => {
  const v = fields.map((x) => U.escape(data[x.name])).join(", ");

  return "(" + v + ")";
};

const getValuesInsertMultiple = (data: any[], fields: T.Field[]) =>
  data.map((d) => getValuesInsert(d, fields)).join(", ");

const toQueryInsert = (entity: T.Entity, data: any) => {
  const fields = entity.fields.map((x) => U.fieldToColumn(x)).join(", ");

  const values = Array.isArray(data)
    ? getValuesInsertMultiple(data, entity.fields)
    : getValuesInsert(data, entity.fields);
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
  entities: T.Entity[]
): string[] =>
  Object.entries(query)
    .map(([entity, queryParams]) => {
      const modelEntity = entities.find((x) => x.name === entity);
      if (!modelEntity) {
        throw Error("entity not found" + entity);
      }

      if (queryParams.insert) {
        return toQueryInsert(modelEntity, queryParams.insert.data);
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
