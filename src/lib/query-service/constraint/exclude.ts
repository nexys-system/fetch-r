import {
  FilterConstraint,
  MutateConstraint,
  ProjectionConstraint,
  QueryConstraint,
} from "./type.js";

type Uuid = string;

interface Entity {
  name: string;
  fields: { name: string; type: string }[];
}

const projections = (
  model: Entity[],
  entities: string[]
): [string, ProjectionConstraint[]][] =>
  model
    .filter((x) => !entities.includes(x.name))
    .map((entity) => {
      return [
        entity.name,
        entity.fields
          .filter((x) => !entities.includes(x.type))
          .map((x) => ({ attribute: x.name })),
      ];
    });

const filters = (
  model: Entity[],
  excludedEntities: { name: string; filterAttribute: { uuid: Uuid } }[]
): [string, FilterConstraint[]][] => {
  const filterConstraints: [string, FilterConstraint[]][] =
    excludedEntities.map((excludedEntity) => {
      return [
        excludedEntity.name,
        [
          {
            attribute: "uuid",
            filterAttribute: excludedEntity.filterAttribute,
          },
        ],
      ] as any; // todo fix
    });

  model.forEach((entity) => {
    const { fields } = entity;

    excludedEntities.forEach((excludedEntity) => {
      const f = fields.find((x) => x.type === excludedEntity.name);

      if (f) {
        filterConstraints.push([
          entity.name,
          [
            {
              attribute: f.name,
              filterAttribute: excludedEntity.filterAttribute as any, // todo fix
            },
          ],
        ]);
      }
    });
  });

  return filterConstraints;
};

export const queryConstraints = (
  model: Entity[],
  excludedEntities: { name: string; filterAttribute: { uuid: Uuid } }[],
  append: Object
): {
  data: QueryConstraint;
  mutate: MutateConstraint;
} => {
  const projectionConstraints: [string, ProjectionConstraint[]][] = projections(
    model,
    excludedEntities.map((x) => x.name)
  );

  const filterConstraints = filters(model, excludedEntities);

  const data: QueryConstraint = {
    filterConstraintsMap: new Map(filterConstraints),
    projectionConstraintsMap: new Map(projectionConstraints),
  };

  const mutate: MutateConstraint = {
    filterConstraintsMap: new Map(),
    dataConstraintsMap: new Map(),
    append,
  };
  return { data, mutate };
};
