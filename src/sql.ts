import NUtils from "@nexys/utils";
import { entities } from "./model";
import * as T from "./type";
import * as U from "./utils";

// SQL

const getFilters = (modelUnit: T.Entity, filters?: T.QueryFilters): string => {
  if (!filters) {
    return "1";
  }

  return Object.entries(filters)
    .map(([col, value]) => {
      const field = U.findField(modelUnit, col);

      return field.column + "=" + U.escape(value);
    })
    .join(" AND ");
};

const handleJoin = (
  models: T.Entity[],
  field: T.Field,
  modelUnit: T.Entity,
  qProjection: boolean | T.QueryProjection,
  joins: T.Join[]
) => {
  const modelUnitChild = models.find((x) => x.name === field.type);

  if (!modelUnitChild) {
    throw Error(
      "could not find associated model, for joined field: " +
        modelUnit.name +
        ":" +
        field.name
    );
  }

  const projection: T.QueryProjection =
    typeof qProjection === "boolean" ? {} : qProjection;

  getProjectionFields(modelUnitChild, models, joins, projection);

  joins.push({
    entity: modelUnitChild,
    field,
    parent: modelUnit,
    projection,
  });
};

const getProjectionFields = (
  modelUnit: T.Entity,
  models: T.Entity[],
  joins: T.Join[],
  projection?: T.QueryProjection
): {
  pFields: { name: string; column: string }[];
  joins: T.Join[];
} => {
  if (!projection) {
    const fieldObject: T.QueryProjection = {};
    modelUnit.fields.forEach((field) => {
      fieldObject[field.name] = true;
    });

    return getProjectionFields(modelUnit, models, joins, fieldObject);
  }

  const pFields: { name: string; column: string }[] = Object.entries(projection)
    .map(([col, qProjection]) => {
      const field = modelUnit.fields.find((x) => x.name === col);
      if (!field) {
        throw Error(
          "SQL field could not be found:" + modelUnit.name + ":" + col
        );
      }

      // check if the type refers to another table, if so join
      if (!U.isStandardType(field.type)) {
        handleJoin(models, field, modelUnit, qProjection, joins);
      }

      if (qProjection === true) {
        const colName =
          field.column || NUtils.string.camelToSnakeCase(field.name);
        return { name: field.name, column: colName };
      }

      return undefined;
    })
    .filter(NUtils.array.notEmpty);

  if (modelUnit.uuid) {
    pFields.unshift({ name: "uuid", column: "uuid" });
  } else {
    pFields.unshift({ name: "id", column: "id" });
  }

  return { pFields, joins };
};

const getProjectionString = (
  projectionArray: { name: string; column: string }[],
  table?: string,
  alias: boolean = false
) => {
  if (projectionArray.length === 0) {
    return "*";
  }

  return projectionArray
    .map(
      (x) =>
        (table ? table + "." : "") +
        "`" +
        x.column +
        "`" +
        (alias ? " as " + table + "_" + x.column : "")
    )
    .join(", ");
};

/**
 * generates SQL query for one query
 * @param params
 * @param modelUnit
 * @param model
 * @returns
 */
export const toQuery = (
  params: T.QueryParams,
  modelUnit: T.Entity,
  model: T.Entity[]
): {
  query: string;
  projection: { name: string; column: string }[];
  joins: T.Join[];
} => {
  const table = U.entityToTable(modelUnit);
  const joins: T.Join[] = [];
  const { pFields: projection } = getProjectionFields(
    modelUnit,
    model,
    joins,
    params.projection
  );

  const joinStrings =
    joins.length === 0
      ? ""
      : ", " +
        joins
          .reverse()
          .map((join, tableIdx) => {
            const table = U.entityToTable(join.entity);
            const { pFields, joins } = getProjectionFields(
              join.entity,
              model,
              [],
              join.projection
            );

            join.pFields = pFields;

            return getProjectionString(pFields, table, true);
          })
          .join(", ");

  const filters = getFilters(modelUnit, params.filters);

  const joinTable = joins
    .map((join, tableIdx) => {
      const table = U.entityToTable(join.entity);
      const alias = table; // "j" + tableIdx;

      return (
        (join.field.optional ? "LEFT" : "") +
        `JOIN ${table} as ${alias} ON ${alias}.id = ${U.entityToTable(
          join.parent
        )}.${
          join.field.column || NUtils.string.camelToSnakeCase(join.field.name)
        }`
      );
    })
    .join("\n");

  const query = [
    `SELECT ${getProjectionString(projection, table)}${joinStrings}`,
    `FROM ${table}`,
    joinTable,
    `WHERE ${filters};`,
  ]
    .filter(NUtils.array.notEmpty)
    .join("\n");

  // console.log(query);

  return { query, projection, joins };
};

/**
 * generates SQL queries (goes through the different queries)
 * @param params
 * @param modelUnit
 * @param model
 * @returns
 */
export const createQuery = (query: T.Query, entities: T.Entity[]): T.SQuery[] =>
  Object.entries(query).map(([entity, queryParams]) => {
    const modelEntity = entities.find((x) => x.name === entity);
    if (!modelEntity) {
      throw Error("entity not found" + entity);
    }

    const { query, projection, joins } = toQuery(
      queryParams,
      modelEntity,
      entities
    );

    return { query, projection, joins, entity, modelEntity };
  });

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
  )} SET ${values} WHERE ${filterString} ;`;
};

const toQueryDelete = (
  entity: T.Entity,

  filters: T.QueryFilters
) => {
  const filterString = getFilters(entity, filters);

  return `DELETE FROM ${U.entityToTable(entity)}  WHERE ${filterString} ;`;
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
