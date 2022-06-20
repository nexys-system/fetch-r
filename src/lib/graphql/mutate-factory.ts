import * as GL from "graphql";

import { Entity, MutateResponseDelete, MutateResponseInsert } from "../type";
import { Connection } from "../database";

import * as Exec from "../exec";
import { foreignId, foreignUuid, getArgs } from "./utils";
import { createTypesFromModel } from "./type-factory";
import { GLTypes } from "./type";

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
const mutateReponseDeleteType: GL.GraphQLOutputType = new GL.GraphQLObjectType({
  name: "MutateReponseDelete",
  fields: {
    deleted: { type: new GL.GraphQLNonNull(GL.GraphQLInt) },
    success: { type: new GL.GraphQLNonNull(GL.GraphQLBoolean) },
  },
});

const insertOneRow = async <A>(
  entity: string,
  data: A,
  def: Entity[],
  s: Connection.SQL
): Promise<MutateResponseInsert> => {
  const r = await Exec.mutate({ [entity]: { insert: { data } } }, def, s);

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
  const r = await Exec.mutate({ [entity]: { delete: { filters } } }, def, s);
  const { delete: delete2 } = r[entity];

  if (!delete2) {
    throw Error(
      "the expected MutateResponseInsert out type did not have the expected shape: " +
        JSON.stringify(delete2)
    );
  }

  return delete2;
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
  // TODO

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
