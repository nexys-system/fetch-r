import NUtils from "@nexys/utils";
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

const getProjectionFields = (
  modelUnit: T.Entity,
  models: T.Entity[],
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

    return getProjectionFields(modelUnit, models, fieldObject);
  }

  const joins: T.Join[] = [];

  const ar: { name: string; column: string }[] = Object.entries(projection)
    .map(([col, val]) => {
      const field = modelUnit.fields.find((x) => x.name === col);
      if (!field) {
        throw Error("field could not be found:" + modelUnit.name + ":" + col);
      }

      if (!U.isStandardType(field.type)) {
        const modelUnitChild = models.find((x) => x.name === field.type);

        if (!modelUnitChild) {
          throw Error(
            "could not find associated model, for joined field: " +
              modelUnit.name +
              ":" +
              col
          );
        }
        joins.push({
          entity: modelUnitChild,
          field,
          parentTable:
            modelUnit.table || NUtils.string.camelToSnakeCase(modelUnit.name),
          projection: typeof val === "boolean" ? {} : val,
        });
      }

      if (val === true) {
        const colName =
          field.column || NUtils.string.camelToSnakeCase(field.name);
        return { name: field.name, column: colName };
      }

      return undefined;
    })
    .filter(NUtils.array.notEmpty);

  if (modelUnit.uuid) {
    ar.unshift({ name: "uuid", column: "uuid" });
  } else {
    ar.unshift({ name: "id", column: "id" });
  }

  return { pFields: ar, joins };
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
  const { pFields: projection, joins } = getProjectionFields(
    modelUnit,
    model,
    params.projection
  );

  const joinStrings =
    joins.length === 0
      ? ""
      : ", " +
        joins
          .map((join, tableIdx) => {
            const { pFields, joins } = getProjectionFields(
              join.entity,
              model,
              join.projection
            );

            join.pFields = pFields;

            return getProjectionString(pFields, "j" + tableIdx, true);
          })
          .join(", ");

  const filters = getFilters(modelUnit, params.filters);

  const joinTable = joins
    .map((join, tableIdx) => {
      const table = U.entityToTable(join.entity);
      const alias = "j" + tableIdx;

      return (
        (join.field.optional ? "LEFT" : "") +
        `JOIN ${table} as ${alias} ON ${alias}.id = ${join.parentTable}.${
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

export const createQuery = (
  query: T.Query,
  entities: T.Entity[]
): {
  query: string;
  entity: string;
  modelEntity: T.Entity;
  projection: { name: string; column: string }[];
  joins: T.Join[];
}[] =>
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

//const parseResponse = ()
