import { GraphQLSchema } from "graphql";
import { Connection } from "../database";

import { Entity } from "../type";

import * as SchemaFactory from "./schema-factory";
import { Submodel } from "./type";

class GQLSchema<Permission> {
  roleQLSchemaMap: Map<
    Permission,
    (ids: { Instance: string; User: string }) => GraphQLSchema
  >;

  // superadmin gql schema
  gQLSchema: GraphQLSchema;
  // raw model, only used as a public variable
  public rawModel: Entity[];

  constructor(
    def: Entity[],
    s: Connection.SQL,
    submodels: Submodel<Permission>[]
  ) {
    // superadmin schema, which is also the one that is used with the "app authentication"
    this.gQLSchema = SchemaFactory.getSchemaFromModel(def, s);

    this.roleQLSchemaMap = new Map(
      submodels.map(([k, v]) => [
        k,
        (ids: { Instance: string; User: string }) =>
          SchemaFactory.getSchemaFromModel(def, s, v(ids)),
      ])
    );

    this.rawModel = def;
  }

  getSchemaFromCtx = (
    ctx: any,
    roleMap: Map<string, Permission>
  ): GraphQLSchema => {
    const { role } = ctx.params;

    const permission = roleMap.get(role);

    if (!permission) {
      throw { code: 400, msg: `Role "${role}" does not exist` };
    }

    if (permission === (3 as any as Permission)) {
      // 3 is superadmin, in this case return full schema
      return this.gQLSchema;
    }

    const preSchema = this.roleQLSchemaMap.get(permission);

    if (!preSchema) {
      throw { code: 400, msg: `Schema for role "${role}" does not exist` };
    }

    const {
      profile,
      userCache: { permissions },
    } = ctx.state;

    if (!permissions.includes(permission)) {
      throw { code: 400, msg: "not allowed to access this resource" };
    }

    const ids = { User: profile.uuid, Instance: profile.instance.uuid };

    return preSchema(ids);
  };
}

export default GQLSchema;
