import {
  Entity,
  QueryFilters,
  QueryParams,
  QueryProjection,
  Query,
} from "../../../type";
import { FilterConstraint, ProjectionConstraint } from "../type";

const getModelUnit = (entity: string, model: Entity[]): Entity => {
  const f = model.find((x) => x.name === entity);

  if (!f) {
    throw Error(`model entity "${entity}" could not be found`);
  }
  return f;
};

const getField = (field: string, modelUnit: Entity) => {
  const f = modelUnit.fields.find((x) => x.name === field);

  if (!f) {
    throw Error(`model field "${field}" could not be found`);
  }
  return f;
};

const isStandardType = (t: string): boolean => {
  const types = [
    "String",
    "Int",
    "Long",
    "Boolean",
    "LocalDate",
    "LocalDateTime",
    "LocalTime",
    "BigDecimal",
    "Double",
  ];

  return types.includes(t);
};

export const constructProjectionPermission = (
  entity: string,
  projectionConstraintsMap: Map<string, ProjectionConstraint[]>,
  projection: QueryProjection = {},
  model: Entity[],
  depthLevel: number = 1 // depth level
): QueryProjection => {
  // get constraints for entity of interest
  const projectionConstraints = projectionConstraintsMap.get(entity) || [];
  // get entity / modelUnit
  const modelUnit = getModelUnit(entity, model);
  const fkFields = modelUnit.fields.filter((x) => !isStandardType(x.type));
  const fkAttributes: string[] = fkFields.map((x) => x.name);
  const attributes: string[] = projectionConstraints.map((p) => p.attribute);

  const projectionKeys: string[] = Object.keys(projection);
  const allFieldsAreFk: boolean = projectionKeys
    .map((x) => fkAttributes.includes(x))
    .reduce((a, b) => a && b, true);

  // if projection is empty add all permissions (only level 1)
  // note that in the case where only fk are explicittly mentioned: at the first level all other attributes are added
  if (depthLevel === 1 && (projectionKeys.length === 0 || allFieldsAreFk)) {
    attributes.forEach((a) => {
      if (!projection[a]) {
        projection[a] = true;
      }
    });
  }

  const idUuidKey = modelUnit.uuid ? "uuid" : "id";

  // add id/uuid
  projection[idUuidKey] = true;

  Object.keys(projection).forEach((k) => {
    if (k === idUuidKey) {
      // nothing
    } else if (!attributes.includes(k)) {
      delete projection[k];
    } else {
      const field = getField(k, modelUnit);

      // foreign key
      if (!isStandardType(field.type)) {
        if (
          typeof projection[k] === "boolean" ||
          typeof projection[k] === "undefined"
        ) {
          projection[k] = {};
        }

        projection[k] = constructProjectionPermission(
          field.type,
          projectionConstraintsMap,
          projection[k] as QueryProjection,
          model,
          depthLevel + 1
        );
      }
    }
  });

  return projection;
};

export const constructFilterPermission = (
  entity: string,
  projectionConstraintsMap: Map<string, ProjectionConstraint[]>,
  filterConstraintsMap: Map<string, FilterConstraint[]>,
  filters: QueryFilters = {},
  model: Entity[],
  depthLevel: number = 1 // depth level
): QueryFilters => {
  // get constraints for entity of interest
  const projectionConstraints = projectionConstraintsMap.get(entity) || [];
  // get entity / modelUnit
  const modelUnit = getModelUnit(entity, model);
  const idUuidKey = modelUnit.uuid ? "uuid" : "id";
  const attributes: string[] = projectionConstraints.map((p) => p.attribute);

  Object.keys(filters).map((k) => {
    if (k === idUuidKey) {
      // nothing
    } else if (!attributes.includes(k)) {
      delete filters[k];
    } else {
      const field = getField(k, modelUnit);

      // foreign key
      if (!isStandardType(field.type)) {
        if (
          typeof filters[k] === "boolean" ||
          typeof filters[k] === "undefined"
        ) {
          filters[k] = {};
        }

        filters[k] = constructFilterPermission(
          field.type,
          projectionConstraintsMap,
          filterConstraintsMap,
          filters[k] as QueryProjection,
          model,
          depthLevel + 1
        );
      }
    }
  });

  const filterConstraints = filterConstraintsMap.get(entity) || [];
  filterConstraints.forEach((filterConstraint) => {
    filters[filterConstraint.attribute] = filterConstraint.filterAttribute;
  });

  return filters;
};

/**
 * same as above but at the entity level
 * @param entity : entity of interest
 * @param params: params associated with entity
 * @param filterConstraints
 * @param projectionConstraints
 */
export const constructParamsPermission = (
  entity: string,
  params: QueryParams,
  filterConstraintsMap: Map<string, FilterConstraint[]>,
  projectionConstraintsMap: Map<string, ProjectionConstraint[]>,
  model: Entity[]
): QueryParams => {
  params.projection = constructProjectionPermission(
    entity,
    projectionConstraintsMap,
    params.projection,
    model
  );

  params.filters = constructFilterPermission(
    entity,
    projectionConstraintsMap,
    filterConstraintsMap,
    params.filters,
    model
  );

  return params;
};

/**
 * takes any client query and adds constraints so that the user only sees what he/she's allowed to see
 * @param query client query
 * @param entityFilterConstraintsMap : map with filters constraints for all entities
 * @param entityProjectionConstraintsMap : map with projection constraints for all entities
 */
export const constructQueryPermission = (
  query: Query,
  entityFilterConstraintsMap: Map<string, FilterConstraint[]>,
  entityProjectionConstraintsMap: Map<string, ProjectionConstraint[]>,
  model: Entity[],
  entitiesAllowed: string[] = [],
  entitiesNotAllowed: string[] = []
): QueryParams[] => {
  // go through all entities
  return Object.keys(query).map((entity) => {
    const params: QueryParams = query[entity];

    if (entitiesAllowed.length > 0) {
      if (!entitiesAllowed.includes(entity)) {
        throw "entity is not allowed - is not present in list of allowed entities";
      }
    } else {
      if (
        entitiesNotAllowed.length > 0 &&
        entitiesNotAllowed.includes(entity)
      ) {
        throw "entity is not allowed - is present in list of not allowed entities";
      }
    }

    return constructParamsPermission(
      entity,
      params,
      entityFilterConstraintsMap,
      entityProjectionConstraintsMap,
      model
    );
  });
};
