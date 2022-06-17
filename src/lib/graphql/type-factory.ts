import * as GL from "graphql";
import * as T from "./type";
import * as U from "./utils";
import * as UM from "./utils-mapping";

/**
 * creates GL types from the model
 * Note that first entities with no dependencies will need to be added
 * This will break for self referncing entities!
 * @param def
 * @returns
 */
export const createTypesFromModel = (
  def: T.Ddl[],
  constraints?: T.ModelConstraints
): T.GLTypes => {
  const QLtypes: T.GLTypes = new Map();

  const entities = [...def];

  let i = 0;
  const index0 = 0;
  const maxIteration = 1000; // to avoid an infinite loop, in most cases (logically) after i = entities.length*2 it should be done
  while (entities.length > 0 && i < maxIteration) {
    i++;
    // get observed entity (first of the array of entities)
    // observed entity - remove entity from array
    const entity = entities.splice(index0, 1)[0];

    // find fields that are foreign keys (not standard fields)
    const fieldsTypeFk: string[] = entity.fields
      .filter((f) => !U.isFieldType(f.type))
      .map((x) => x.type);

    // among the foreign keys fields, look if they were already handled,
    // if yes the observed entity can be handled since all fks are already present
    const canBeHandled = fieldsTypeFk
      .map((entity) => entities.find((e) => e.name === entity))
      .map((x) => x === undefined)
      .reduce((a, b) => a && b, true);

    //console.log({ entity: entity.name, fieldsTypeFk, f1, f2, f3 });

    if (!canBeHandled) {
      // observed entity cannot be handled
      // adding current entity at the end
      entities.push(entity);
      // abort, go to next iteration
      continue;
    }

    // initialize fields
    const fields: GL.GraphQLFieldConfigMap<any, any> = {};

    // populate fields
    entity.fields
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
      })
      .forEach((field) => {
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

    // create GraphQL Object
    const objectType = new GL.GraphQLObjectType({
      name: entity.name,
      fields,
    });

    // args
    const args: GL.GraphQLFieldConfigArgumentMap = {};

    entity.fields.forEach((f) => {
      const type = UM.mapInputType(f, def);

      args[f.name] = { type };
    });
    // end args

    // add to the list of types
    QLtypes.set(entity.name, {
      objectType,
      args,
    });

    //
  }

  if (entities.length > 0) {
    throw Error(
      "something went wrong while trying to create the schema, most probably a circular reference. Entity array:" +
        JSON.stringify(entities)
    );
  }

  return QLtypes;
};
