import * as GL from "graphql";

import {
  Entity,
  Mutate,
  MutateResponseDelete,
  MutateResponseInsert,
} from "../type.js";
import { Connection } from "../database/index.js";

import * as Exec from "../exec.js";
import { foreignId, foreignUuid, getArgs } from "./utils.js";
import { createTypesFromModel } from "./type-factory.js";
import { GLTypes } from "./type.js";
import { DatabaseType } from "../database/type.js";

// this is the graphql equivalent of MutateResponseInsert
const mutateReponseInsertType: GL.GraphQLOutputType = new GL.GraphQLObjectType({
  name: "MutateReponseInsert",
  fields: {
    id: { type: GL.GraphQLInt },
    uuid: { type: GL.GraphQLID },
    success: { type: new GL.GraphQLNonNull(GL.GraphQLBoolean) },
  },
});

// this is the graphql equivalent of MutateResponseDelete
const mutateReponseUpdateType: GL.GraphQLOutputType = new GL.GraphQLObjectType({
  name: "MutateReponseUpdate",
  fields: {
    updated: { type: new GL.GraphQLNonNull(GL.GraphQLInt) },
    success: { type: new GL.GraphQLNonNull(GL.GraphQLBoolean) },
  },
});

// this is the graphql equivalent of MutateResponseDelete
const mutateReponseDeleteType: GL.GraphQLOutputType = new GL.GraphQLObjectType({
  name: "MutateReponseDelete",
  fields: {
    deleted: { type: new GL.GraphQLNonNull(GL.GraphQLInt) },
    success: { type: new GL.GraphQLNonNull(GL.GraphQLBoolean) },
  },
});

const databaseType: DatabaseType = "MySQL";

const insertOneRow = async <A>(
  entity: string,
  data: A,
  def: Entity[],
  s: Connection.SQL
): Promise<MutateResponseInsert> => {
  const mq: Mutate<A> = { [entity]: { insert: { data } } };
  const r = await Exec.mutate(mq, def, s, databaseType);

  const { insert } = r[entity];

  if (!insert || Array.isArray(insert)) {
    throw Error(
      "the expected MutateResponseInsert out type did not have the expected shape: " +
        JSON.stringify(insert)
    );
  }

  return insert;
};

const deleteById = async (
  entity: string,
  filters: { id?: number; uuid?: string },
  def: Entity[],
  s: Connection.SQL
): Promise<MutateResponseDelete> => {
  const r = await Exec.mutate(
    { [entity]: { delete: { filters } } },
    def,
    s,
    databaseType
  );
  const response = r[entity];

  if (!response.delete) {
    throw Error(
      "the expected MutateResponseInsert out type did not have the expected shape: " +
        JSON.stringify(response.delete)
    );
  }

  return response.delete;
};

const update = async <A>(
  entity: string,
  data: Partial<A>,
  filters: { id?: number; uuid?: string },
  def: Entity[],
  s: Connection.SQL
) => {
  const mutateResponse = await Exec.mutate(
    { [entity]: { update: { data, filters } } },
    def,
    s,
    databaseType
  );

  return mutateResponse[entity]["update"];
};

export const getMutation = (
  def: Entity[],
  s: Connection.SQL,
  constraints: undefined = undefined
) => {
  const QLTypes: GLTypes = createTypesFromModel(def, constraints, true);

  const fields: GL.ThunkObjMap<GL.GraphQLFieldConfig<any, any, any>> = {};

  // add insert
  def.forEach((entity) => {
    fields["insert" + entity.name] = {
      type: mutateReponseInsertType,
      args: getArgs(entity.name, QLTypes, true),
      resolve: async (_source, args) => insertOneRow(entity.name, args, def, s),
    };
  });

  // add update
  def.forEach((entity) => {
    const qlType = QLTypes.get(entity.name);

    if (!qlType) {
      throw Error("qltype for " + entity.name + " could not be retrieved");
    }

    const argFields: GL.GraphQLFieldConfigArgumentMap = qlType.argsPartial;

    const data = new GL.GraphQLInputObjectType({
      name: entity.name + "Update",
      fields: argFields,
    });

    const argFieldsFilter: GL.GraphQLFieldConfigArgumentMap = { ...argFields };

    if (entity.uuid) {
      argFieldsFilter["uuid"] = { type: GL.GraphQLID };
    } else {
      argFieldsFilter["id"] = { type: GL.GraphQLInt };
    }

    const filters = new GL.GraphQLInputObjectType({
      name: entity.name + "UpdateFilter",
      fields: argFieldsFilter,
    });

    fields["update" + entity.name] = {
      type: mutateReponseUpdateType,
      args: {
        data: { type: data },
        filters: { type: filters },
      },
      resolve: async (_source, args) => {
        const { data, filters } = args;

        if (Object.keys(filters).length === 0) {
          throw Error("at least one filter arg must be given");
        }

        return update(entity.name, data, filters, def, s);
      },
    };
  });

  // add delete
  def.forEach((entity) => {
    fields["delete" + entity.name] = {
      type: mutateReponseDeleteType,
      args: {
        input: { type: entity.uuid ? foreignUuid : foreignId },
      },
      resolve: async (_source, args) =>
        deleteById(entity.name, args.input, def, s),
    };
  });

  return new GL.GraphQLObjectType({
    name: "Mutation",
    fields,
  });
};
