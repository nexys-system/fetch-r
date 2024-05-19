import { Entity } from "../../type.js";

import { Profile, Constraint, Permission } from "./type.js";

import DefaultConstraints from "./default-constraints.js";

const roleKeys = [Permission.app, Permission.admin, Permission.superadmin];

class ConstraintGenerator extends DefaultConstraints {
  constructor(model: Entity[]) {
    super(model);
  }

  getConstraintByRole = (r: Permission, profile: Profile): Constraint => {
    if (r === Permission.admin) {
      return this.getAdmin(profile);
    }

    if (r === Permission.superadmin) {
      return this.getSuperadmin(profile);
    }

    if (r === Permission.app) {
      return this.getApp(profile);
    }

    throw Error("todo - only standard roles are accepted for now");
  };

  /**
   *
   * @param profile user profile
   * @returns map of constraints for the user (every constraint map is different die to different uuid and instance etc)
   */
  byRole = (profile: Profile): Map<Permission, Constraint> =>
    new Map(roleKeys.map((r) => [r, this.getConstraintByRole(r, profile)]));
}

export default ConstraintGenerator;
