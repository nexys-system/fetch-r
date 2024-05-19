import * as T from "../type.js";
import { camelToSnakeCase, isStandardType } from "../utils.js";

export const addColumnsToModel = (es: T.Entity[]) => {
  es.forEach((entity) => {
    entity.fields.forEach((field) => {
      const { column } = field;

      if (!column || column === "") {
        field.column = camelToSnakeCase(field.name);

        if (!isStandardType(field.type)) {
          field.column += "_id";
        }
      }
    });
  });
};
