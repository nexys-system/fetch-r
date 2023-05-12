import * as GL from "graphql";
import { Entity, Field } from "../type";
import * as T from "./type";
import * as UM from "./utils-mapping";

const getObjectType = (
  filteredEntityFields: Field[],
  QLtypes: T.GLTypes,
  entityName: string
): GL.GraphQLObjectType => {
  // self referencing
  // see https://stackoverflow.com/questions/32551022/how-do-i-create-a-graphql-schema-for-a-self-referencing-data-hierarchy
  const selfReferencingFields: Field[] = filteredEntityFields.filter(
    (x) => x.type === entityName
  );

  const objectType = new GL.GraphQLObjectType({
    name: entityName,
    fields: () => {
      const fields = getFields(filteredEntityFields, QLtypes);
      selfReferencingFields.forEach((selfRefField) => {
        const type: GL.GraphQLOutputType =
          selfRefField.optional === true
            ? objectType
            : new GL.GraphQLNonNull(objectType);
        fields[selfRefField.name] = { type };
      });

      return fields;
    },
  });

  return objectType;
};

const getFields = (
  filteredEntityFields: Field[],
  QLtypes: T.GLTypes
): GL.GraphQLFieldConfigMap<any, any> => {
  // initialize fields
  const fields: GL.GraphQLFieldConfigMap<any, any> = {};
  // populate fields
  filteredEntityFields.forEach((field) => {
    const pType: GL.GraphQLOutputType | undefined = UM.mapOutputType(
      field,
      QLtypes
    );

    if (pType) {
      const type: GL.GraphQLOutputType =
        field.optional === true ? pType : new GL.GraphQLNonNull(pType);

      // add field to GLField for observed entity
      fields[field.name] = { type };
    }
  });

  return fields;
};

/**
 * creates GL types from the model
 * Note that first entities with no dependencies will need to be added
 * This will break for self referncing entities!
 * @param def
 * @returns
 */
export const createTypesFromModel = (
  def: Entity[],
  constraints?: T.ModelConstraints,
  inputTypeWithOptional: boolean = false
): T.GLTypes => {
  const QLtypes: T.GLTypes = new Map();

  const entities = [...def];

  // go through all entities
  entities.forEach((entity) => {
    // console.log(entities.length); //, entity);

    const filteredEntityFields = entity.fields
      // only add fields that are in constraints projections (if constraints exists)
      .filter((field) => {
        if (!constraints) {
          return true;
        }

        if (["id", "uuid"].includes(field.name)) {
          return true;
        }

        const { projection } = constraints[entity.name];

        if (!projection) {
          return true;
        }

        if (projection[field.name] === true) {
          return true;
        }

        return false;
      });

    // create GraphQL Object
    const objectType = getObjectType(
      filteredEntityFields,
      QLtypes,
      entity.name
    );

    // args
    const args: GL.GraphQLFieldConfigArgumentMap = {};
    // args partial is the same as arg but all arguments are optional. i.e. going from A to Partial<A>
    const argsPartial: GL.GraphQLFieldConfigArgumentMap = {};

    entity.fields.forEach((f) => {
      const preType: GL.GraphQLInputType = UM.mapInputType(f, def);
      const type: GL.GraphQLInputType =
        inputTypeWithOptional === false || f.optional === true
          ? preType
          : new GL.GraphQLNonNull(preType);

      args[f.name] = { type };
      argsPartial[f.name] = { type: preType };
    });
    // end args

    // add to the list of types
    QLtypes.set(entity.name, {
      objectType,
      args,
      argsPartial,
    });

    //
  });

  return QLtypes;
};
