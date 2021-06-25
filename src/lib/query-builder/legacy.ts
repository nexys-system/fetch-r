/**
 * set of helper functions to augment queries so they would return the same results as the old API
 */
import * as U from "../utils";
import * as T from "../type";
export const allFieldsAreFk = (
  fs: T.Field[],
  projection: T.QueryProjection
): boolean =>
  fs
    .filter((x) => !!projection[x.name])
    .map((x) => !U.isStandardType(x.type))
    .reduce((a, b) => a && b, true);

export const augment = (
  entity: string,
  projection: T.QueryProjection,
  model: T.Entity[]
) => {
  const modelUnit = model.find((x) => x.name === entity);

  if (!modelUnit) {
    throw Error(
      "could not find entity in model, when augmenting query (legacy mode)"
    );
  }
  if (allFieldsAreFk(modelUnit.fields, projection)) {
    modelUnit.fields.map((field) => {
      const g = projection[field.name];

      if (!g) {
        projection[field.name] = true;
      } else {
        // here add all fields for child entity
        if (!projection[field.name]) {
          projection[field.name] = {} as T.QueryProjection;
        }
        augment(field.type, projection[field.name] as T.QueryProjection, model);
      }
    });
  }
};
