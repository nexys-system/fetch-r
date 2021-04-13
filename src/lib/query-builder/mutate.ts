import NUtils from "@nexys/utils";
import { getModel } from "./utils";
import * as T from "../type";
import * as U from "../utils";

// SQL
export const getFilterUnit = (
  col: string,
  value: T.QueryFilters<any> | T.FilterAttribute,
  modelUnit: T.Entity,
  model: T.Entity[] = []
): string => {
  const field = U.findField(modelUnit, col);
  // optional case
  if (!value) {
    if (field.optional === false) {
      throw Error(
        `linked field: "${field.name}" is mandatory, can't be set to NULL`
      );
    }
    return `\`${field.column}\`=NULL`;
  }

  if (!U.isStandardType(field.type)) {
    // find associated model
    const modelFk = getModel(field.type, model);

    // make sure it is an object
    if (typeof value !== "object") {
      const exampleFilter = modelFk.uuid ? '{uuid: "myuuid"}' : "{id: xx}";
      const e = `linked field: "${field.name}" was assigned a non object value. It should be like ${exampleFilter}`;
      throw Error(e);
    }

    if (
      (value as { id: number }).id &&
      typeof (value as { id: number }).id === "number"
    ) {
      return `\`${field.column}\`=${U.escape((value as { id: number }).id)}`;
    }

    if (
      (value as { uuid: number }).uuid &&
      typeof (value as { uuid: number }).uuid === "string"
    ) {
      return `\`${field.column}\`=(SELECT id FROM \`${U.entityToTable(
        modelFk
      )}\` WHERE uuid=${U.escape((value as { uuid: number }).uuid)})`;
    }

    try {
      const f = getFilters(modelFk, value as any, model);

      return `\`${field.column}\` IN (SELECT id FROM \`${U.entityToTable(
        modelFk
      )}\` WHERE ${f})`;
    } catch (err) {
      throw Error(
        `mapping error: ${field.type} - ${field.name} - ${JSON.stringify(
          value
        )}`
      );
    }
  }

  return `\`${field.column}\`=${U.escape(value)}`;
};

const getFilters = (
  modelUnit: T.Entity,
  filters?: T.QueryFilters,
  model: T.Entity[] = []
): string => {
  if (!filters) {
    return "1";
  }

  return Object.entries(filters)
    .map(([col, value]) => getFilterUnit(col, value, modelUnit, model))
    .join(" AND ");
};

const getSubQuery = (field: T.Field, model: T.Entity[], v: any) => {
  const entity = getModel(field.type, model);

  const idUuid = entity.uuid ? "uuid" : "id";
  const w = entity.uuid ? U.escape(v.uuid) : Number(v.id);

  // the code can be stopped here for ID
  /*
  if (!entity.uuid) {
    return w;
  }*/

  const table = U.entityToTable(entity);

  return `(SELECT id FROM \`${table}\` WHERE ${idUuid}=${w})`;
};

const getValueInsertUnit = (v: any, field: T.Field, model: T.Entity[]) => {
  if (field.optional && !v) {
    return "NULL";
  }

  if (!U.isStandardType(field.type)) {
    return getSubQuery(field, model, v);
  }

  switch (field.type) {
    case "LocalDateTime":
      return U.escape(new Date(v).toISOString());
    default:
      return U.escape(v);
  }
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
    .map((field) => getValueInsertUnit(data[field.name], field, model))
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
  filters: T.QueryFilters,
  model: T.Entity[]
) => {
  const filterString = getFilters(entity, filters, model);

  const values = Object.entries(data)
    .filter(([k]) => k !== "id" && k !== "uuid") // here drop id, or uuid, since they can't be updated
    .map(([k, v]) => {
      const field = entity.fields.find((x) => x.name === k);

      if (!field) {
        throw Error(`update: cannot find ${entity.name}.${k}`);
      }

      const col = U.fieldToColumn(field);

      if (!U.isStandardType(field.type)) {
        // if same entity, do not link extra table
        if (field.type === entity.name && (v as { id: number }).id) {
          return col + "=" + (v as { id: number }).id;
        }

        return col + "=" + getSubQuery(field, model, v);
      }

      return `${col}=${U.escape(v)}`;
    })
    .join(", ");
  return `UPDATE ${U.entityToTable(
    entity
  )} SET ${values} WHERE ${filterString};`;
};

const toQueryDelete = (
  entity: T.Entity,
  filters: T.QueryFilters,
  model: T.Entity[]
) => {
  const filterString = getFilters(entity, filters, model);

  return `DELETE FROM ${U.entityToTable(entity)} WHERE ${filterString};`;
};

export const createMutateQuery = (
  query: T.Mutate,
  model: T.Entity[]
): { type: T.MutateType; entity: T.Entity; sql: string }[] =>
  Object.entries(query)
    .map(([entity, queryParams]) => {
      const modelEntity = getModel(entity, model);

      if (queryParams.insert) {
        return {
          type: T.MutateType.insert,
          entity: modelEntity,
          sql: toQueryInsert(modelEntity, queryParams.insert.data, model),
        };
      }

      if (queryParams.update) {
        return {
          type: T.MutateType.update,
          entity: modelEntity,
          sql: toQueryUpdate(
            modelEntity,
            queryParams.update.data,
            queryParams.update.filters,
            model
          ),
        };
      }

      if (queryParams.delete) {
        return {
          type: T.MutateType.delete,
          entity: modelEntity,
          sql: toQueryDelete(modelEntity, queryParams.delete.filters, model),
        };
      }

      return;
    })
    .filter(NUtils.array.notEmpty);
