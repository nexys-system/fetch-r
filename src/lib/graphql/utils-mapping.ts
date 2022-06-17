import * as GL from "graphql";
import * as T from "./type";
import * as U from "./utils";

export const mapInputType = (
  { name, type }: T.Field,
  def: T.Ddl[]
): GL.GraphQLInputType => {
  // if the field is not a standard field (i.e foreign key)
  // allow the user to filter by id/uuid
  if (!U.isFieldType(type)) {
    const entity = def.find((e) => e.name === type);

    if (entity) {
      if (entity.uuid) {
        return U.foreignUuid;
      } else {
        return U.foreignId;
      }
    }

    throw Error("map input type: entity could not be found");
  }

  return mapScalarType(type, name);
};

export const mapOutputType = (
  { name, type }: T.Field,
  entityTypes: T.GLTypes = new Map()
): GL.GraphQLOutputType | undefined => {
  if (!U.isFieldType(type)) {
    const foreignEntity = entityTypes.get(type);

    if (!foreignEntity) {
      return undefined;
    }

    return foreignEntity.objectType;
  }

  return mapScalarType(type, name);
};

const mapScalarType = (
  type: T.FieldType,
  name?: string
): GL.GraphQLScalarType => {
  if (
    // (name === "id" && type === "Int") ||
    // id in graphql is a string
    name &&
    (name === "uuid" || name === "id") &&
    type === "String"
  ) {
    return GL.GraphQLID;
  }

  switch (type) {
    case "Int":
      // to consider (not practial becaues returns a string
      // return  toEnum(entity, t)
      return GL.GraphQLInt;
    case "Float":
    case "BigDecimal":
      return GL.GraphQLFloat;
    case "Boolean":
      return GL.GraphQLBoolean;
    case "LocalDate":
    case "LocalDateTime":
      return GL.GraphQLString; // date returns a string
    case "String":
      return GL.GraphQLString;
  }
};
