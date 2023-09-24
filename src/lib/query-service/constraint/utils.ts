import { MutateResponse } from "../../type";
import * as QueryTypes from "./type";

/**
 *
 * @param err takes error message from CRUD and translates to json that can be interpreted
 */
export const formatErrors = (err: string) => {
  const e = err
    .replace(/^List\(/, "{")
    .replace(/\)$/, "}")
    .replace(/\(List\(([^\)]+)\)/gi, '"$1"')
    .replace(/,CrudFieldRequiredError\(([^\)]+)\)\)/gi, ': ["$1"]');

  try {
    return JSON.parse(e);
  } catch (err) {
    return {
      name: [e],
    };
  }
};

export const addConstraint = (
  map: Map<string, QueryTypes.ProjectionConstraint[]>,
  entity: string,
  constraint: QueryTypes.ProjectionConstraint
): void => {
  const entry: QueryTypes.ProjectionConstraint[] = map.get(entity) || [];

  const newEntry: QueryTypes.ProjectionConstraint[] = [...entry, constraint];
  map.set(entity, newEntry);
};

export const mutatePostProcessing = (response: MutateResponse) => {
  let errorObj = {};

  Object.keys(response).map((entity) => {
    const a = response[entity];
    if (a.insert && !Array.isArray(a.insert)) {
      const { success, status } = a.insert;

      if (success === false && status) {
        const errUnit = formatErrors(status);
        errorObj = { ...errorObj, ...errUnit };
      }
    }
  });

  if (Object.keys(errorObj).length === 0) {
    return { status: 200, body: response };
  }

  return { status: 400, body: errorObj };
};
