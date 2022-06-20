import { Entity, QueryFilters, QueryProjection } from "../type";
import * as T from "./type";

type Uuid = string;

export const createAdminConstraints = (def: Entity[]) =>
  createConstraintsFromEntities<"Instance", string | number>(def);

export const createAppConstraint = (def: Entity[]) =>
  createConstraintsFromEntities<"Instance" | "User", string | number>(def);

/**
 * create submodel from model and filters based on chosen entities
 * @paramn ObservedEntites: list of entities
 */
export const createConstraintsFromEntities =
  <ObservedEntity extends string, Id extends Uuid | number>(def: Entity[]) =>
  (ids: { [key in ObservedEntity]: Id }): T.ModelConstraints => {
    const r: T.ModelConstraints = {};

    // turn entity types into strings
    const entitiesOfInterest: string[] = Object.keys(ids);

    def.map((entity) => {
      const projection: QueryProjection = {};
      const filters: QueryFilters = {};

      // add projection
      entity.fields
        .filter((f) => !entitiesOfInterest.includes(f.type))
        .forEach((f) => {
          projection[f.name] = true;
        });

      // add filters - is the key a uuid or id?

      // on entity itself
      if (entitiesOfInterest.includes(entity.name)) {
        const id = ids[entity.name as ObservedEntity];
        const idKey = entity.uuid ? "uuid" : "id";
        filters[idKey] = id;
      }
      // on fk
      entity.fields
        .filter((f) => entitiesOfInterest.includes(f.type))
        .forEach((f) => {
          const id = ids[f.type as ObservedEntity];
          const fkEntity = def.find((x) => x.name === f.type);

          if (!fkEntity) {
            throw Error(
              "could not find foreign key entity when creating constraints"
            );
          }

          const idKey = fkEntity.uuid ? "uuid" : "id";
          filters[f.name] = { [idKey]: id };
        });
      // filters end

      r[entity.name] = { projection, filters };
    });

    return r;
  };
