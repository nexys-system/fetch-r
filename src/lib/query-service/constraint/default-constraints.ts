import { Entity } from "../../type.js";
import * as T from "./type.js";
import * as Exclude from "./exclude.js";

export const defaultAppend = ({
  uuid,
  instance,
}: Pick<T.Profile, "uuid" | "instance">) => ({
  instance,
  user: { uuid },
  logUser: { uuid },
  logDateAdded: new Date(),
});

class DefaultConstraints {
  model: Entity[];

  constructor(model: Entity[]) {
    this.model = model;
  }

  public getSuperadmin = (profile: Pick<T.Profile, "uuid" | "instance">) => {
    const data: T.QueryConstraint = {
      filterConstraintsMap: new Map(),
      projectionConstraintsMap: new Map(
        this.model.map((entity) => {
          return [
            entity.name,
            entity.fields.map((x) => ({ attribute: x.name })),
          ];
        })
      ),
    };

    const mutate: T.MutateConstraint = {
      filterConstraintsMap: new Map(),
      dataConstraintsMap: new Map(),
      append: defaultAppend(profile),
    };
    return { data, mutate };
  };

  // filter on instance and linked entities
  getAdmin = (profile: Pick<T.Profile, "uuid" | "instance">): T.Constraint => {
    const excludedEntities = [
      { name: "Instance", filterAttribute: profile.instance },
    ];
    const append = defaultAppend(profile);

    return Exclude.queryConstraints(this.model, excludedEntities, append);
  };

  // todo here user
  // todo2: generate these when logging in, upon refresh token get the newest set
  getApp = (profile: Pick<T.Profile, "uuid" | "instance">): T.Constraint => {
    const excludedEntities = [
      { name: "Instance", filterAttribute: profile.instance },
      { name: "User", filterAttribute: { uuid: profile.uuid } },
    ];

    const append = defaultAppend(profile);

    return Exclude.queryConstraints(this.model, excludedEntities, append);
  };
}

export default DefaultConstraints;
