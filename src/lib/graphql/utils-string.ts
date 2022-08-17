// this file is actualy not referenced elsewhere in the code (except for tests)
import { Entity, Field } from "../type";
import * as T from "./type";
import * as U from "./utils";

// not used
const mapTypesString = ({ name, type }: Field): string => {
  if (!U.isFieldType(type)) {
    return type;
  }

  return mapTypeScalar(type, name);
};

const mapTypeScalar = (type: T.FieldType, name?: string): T.GLBasicType => {
  if (
    // (name === "id" && type === "Int") ||
    // id in graphql is a string
    name &&
    (name === "uuid" || name === "id") &&
    type === "String"
  ) {
    return "ID";
  }

  switch (type) {
    case "Int":
    case "Long":
      return "Int";
    case "Float":
    case "BigDecimal":
    case "Double":
      return "Float";
    case "Boolean":
      return "Boolean";
    case "LocalDate":
    case "LocalDateTime":
      return "String";
    case "String":
      return "String";
  }

  throw Error("coulr not map scalar type (GLBasicType): " + type);
};

export const getSchemaArrayFromDDL = (def: Entity[]): string[] =>
  def.map((entity) => {
    const fields = entity.fields.map((f) => {
      return `  ${f.name}: ${mapTypesString(f)}${
        f.optional === true ? "" : "!"
      }`;
    });
    return `type ${entity.name} {\n${fields.join("\n")}\n}`;
  });

export const getSchemaFromDDL = (def: Entity[]): string =>
  getSchemaArrayFromDDL(def).join("\n\n");
