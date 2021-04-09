import * as T from "./type";
import * as NUtils from "@nexys/utils/dist/typeguard";

export const checkDatabase = (d: T.Database) => {
  const errors: string[] = [];

  const attributes = ["database", "username", "password", "host"] as const;

  attributes.forEach((attribute) => {
    if (!NUtils.checkField<T.Database>(d, attribute)) {
      errors.push(attribute + " required");
    }
  });

  return errors;
};

export const isDatabase = (d: any): d is T.Database =>
  checkDatabase(d).length === 0;
