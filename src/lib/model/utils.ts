import { camelToSnakeCase } from "@nexys/utils/dist/string";
import * as T from "../type";
import { isStandardType } from "../utils";

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
