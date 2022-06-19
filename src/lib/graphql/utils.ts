import * as GL from "graphql";
import { QueryProjection, QueryFilters, Entity, Field } from "../type";
import * as T from "./type";

// not used
export const getSchemaFromDDL = (def: Entity[]) => {
  const schemaArray = def.map((entity) => {
    const fields = entity.fields.map((f) => {
      return `  ${f.name}: ${mapTypesString(f)}${
        f.optional === true ? "" : "!"
      }`;
    });
    return `type ${entity.name} {\n${fields.join("\n")}\n}`;
  });

  return schemaArray.join("\n\n");
};

export const toEnum = (
  entity: string,
  { name, options }: Field & { options?: T.FieldOption[] }
): GL.GraphQLOutputType => {
  if (!options) {
    return GL.GraphQLInt;
  }

  const values: { [att: string]: { value: number } } = {};

  options.forEach((option) => {
    values[option.id] = { value: option.id };
  });

  return new GL.GraphQLEnumType({
    name: entity + name + "enum",
    values,
  });
};

export const mapTypesString = ({ name, type }: Field): string => {
  if (!isFieldType(type)) {
    return type;
  }

  if (
    // (name === "id" && type === "Int") ||
    // id in graphql is a string
    (name === "uuid" || name === "id") &&
    type === "String"
  ) {
    return "ID";
  }

  if (type === "Int") {
    // return  toEnum(entity, t)

    return "Int";
  }

  if (type === "Float" || type === "BigDecimal") {
    return "Float";
  }

  if (type === "Boolean") {
    return "Boolean";
  }

  // date returns a string
  if (type === "LocalDate" || type === "LocalDateTime") {
    return "String";
  }

  if (type === "String") {
    return "String";
  }

  throw Error("could not map the type");
};
// end not used

export const ddl = (
  ddlComplete: (Omit<Entity, "uuid"> & { uuid?: boolean })[]
): Entity[] =>
  ddlComplete.map((entity) => {
    const fields: Field[] = entity.fields.map((f) => {
      const optional: boolean = f.optional || false;
      return {
        name: f.name,
        type: f.type,
        optional,
        //  options: f.options,
      };
    });

    const isUuid: boolean = entity.uuid || false;

    if (isUuid) {
      fields.unshift({ name: "uuid", type: "String", optional: false });
    } else {
      fields.unshift({ name: "id", type: "Int", optional: false });
    }

    return {
      name: entity.name,
      uuid: isUuid,
      fields,
    };
  });

const availableTypes = [
  "String",
  "Boolean",
  "Int",
  "Float",
  "LocalDateTime",
  "LocalDate",
  "BigDecimal",
];

export const isFieldType = (s: string): s is T.FieldType =>
  availableTypes.includes(s);

export const foreignUuid = new GL.GraphQLInputObjectType({
  name: "ForeignUuid",
  fields: { uuid: { type: new GL.GraphQLNonNull(GL.GraphQLID) } },
});

/*new GL.GraphQLObjectType({
  name: "ForeignUuid",
  fields: { uuid: { type: GL.GraphQLID } },
});*/

export const foreignId = new GL.GraphQLInputObjectType({
  name: "ForeignId",
  fields: { id: { type: new GL.GraphQLNonNull(GL.GraphQLInt) } },
});

export const formatGFields = (a: T.GField): QueryProjection => {
  Object.keys(a).forEach((k) => {
    if (Object.keys(a[k]).length === 0) {
      a[k] = true;
    } else {
      formatGFields(a[k]);
    }
  });

  return a;
};

export const getType = (
  entity: string,
  QLtypes: T.GLTypes
): GL.GraphQLObjectType => {
  const r = QLtypes.get(entity);
  //console.log(r);
  //console.log(entity);

  if (!r || !r.objectType) {
    throw Error("could not find entity " + entity);
  }

  return r.objectType;
};

export const getArgs = (
  entity: string,
  QLtypes: T.GLTypes
): GL.GraphQLFieldConfigArgumentMap => {
  const r = QLtypes.get(entity);

  if (!r || !r.args) {
    throw Error("could not find entity " + entity);
  }

  return {
    ...r.args,
    _take: { type: GL.GraphQLInt },
    _skip: { type: GL.GraphQLInt },
  };
};

export const prepareFilters = (
  entity: { name: string },
  queryFilters: QueryFilters,
  constraints: T.ModelConstraints
): QueryFilters => {
  const constraintsFilter: QueryFilters = constraints
    ? constraints[entity.name].filters || {}
    : {};

  return { ...constraintsFilter, ...queryFilters };
};
