import { Mutate, MutateParams } from "../../../type.js";
import { DataConstraint, FilterConstraint } from "../type.js";
import * as Utils from "./utils.js";

export const constructMutatePermission = (
  query: Mutate,
  entityFilterConstraintsMap: Map<string, FilterConstraint[]>,
  entityDataConstraintsMap: Map<string, DataConstraint[]>,
  insertAppend: Object = {},
  _entitiesAllowed: string[] = [],
  _entitiesNotAllowed: string[] = []
): Mutate => {
  Object.keys(query).forEach((entity) => {
    const q = query[entity];

    // get filter constraints
    const entityFilterConstraints: FilterConstraint[] =
      entityFilterConstraintsMap.get(entity) || [];

    const entityDataConstraints: DataConstraint[] =
      entityDataConstraintsMap.get(entity) || [];

    constructMutatePermissionUnit(
      q,
      entityFilterConstraints,
      entityDataConstraints,
      insertAppend
    );
  });

  return query;
};

export const constructMutatePermissionUnit = (
  params: MutateParams,
  filterConstraints: FilterConstraint[],
  dataConstraints: DataConstraint[],
  insertAppend: any = {}
): MutateParams => {
  if (params.insert) {
    params.insert.data = { ...params.insert.data, ...insertAppend };
  }
  dataConstraints.map((dataConstraint) => {
    if (params.insert) {
      if (Array.isArray(params.insert.data)) {
        params.insert.data.map((d) => {
          d[dataConstraint.attribute] =
            dataConstraint.dataAttribute === "__random"
              ? Utils.generateString(12)
              : dataConstraint.dataAttribute;
        });
      } else {
        params.insert.data[dataConstraint.attribute] =
          dataConstraint.dataAttribute === "__random"
            ? Utils.generateString(12)
            : dataConstraint.dataAttribute;
      }
    }
  });

  filterConstraints.map((filterConstraint) => {
    if (params.update) {
      if (!params.update.filters) {
        params.update.filters = {};
      }

      params.update.filters[filterConstraint.attribute] =
        filterConstraint.filterAttribute;
    }

    if (params.delete) {
      if (!params.delete.filters) {
        params.delete.filters = {};
      }

      params.delete.filters[filterConstraint.attribute] =
        filterConstraint.filterAttribute;
    }
  });

  return params;
};
