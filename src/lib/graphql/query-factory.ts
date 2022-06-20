import graphqlFields from "graphql-fields";

import * as GL from "graphql";
import * as T from "./type";
import * as U from "./utils";

import { Entity, QueryFilters } from "../type";
import { createTypesFromModel } from "./type-factory";

import * as Connection from "../database/connection";
import * as Exec from "../exec";

const fieldResolve =
  (
    def: Entity[],
    s: Connection.SQL,
    entity: { name: string },
    constraints?: T.ModelConstraints
  ) =>
  async (
    _data: any,
    { _take, _skip, ...queryFilters }: any,
    _context: any,
    resolveInfo: any
  ) => {
    if (!constraints || (constraints && !constraints[entity.name])) {
      // return null;
    }

    const projection = U.formatGFields(graphqlFields(resolveInfo));

    const filters: QueryFilters = U.prepareFilters(entity, queryFilters, {
      User: { filters: {} },
      School: { filters: {} },
      Instance: { filters: {} },
    });

    const take: number | undefined = Number(_take) || 10; // never return more than 10 entries unless explicitly specified
    const skip: number | undefined = _skip ? Number(_skip) : undefined;

    const params = {
      projection,
      filters,
      take,
      skip,
    };

    console.log({ params });

    const q = await Exec.exec({ [entity.name]: params }, def, s);
    console.log(q);

    return q[entity.name];
  };

export const getQueryFromModel = (
  def: Entity[],
  s: Connection.SQL,
  constraints?: T.ModelConstraints
): GL.GraphQLObjectType => {
  const QLtypes: T.GLTypes = createTypesFromModel(def, constraints);

  const fields: GL.ThunkObjMap<GL.GraphQLFieldConfig<any, any>> = {};

  def.forEach((entity) => {
    fields[entity.name] = {
      type: new GL.GraphQLList(U.getType(entity.name, QLtypes)),
      args: U.getArgs(entity.name, QLtypes),
      resolve: fieldResolve(def, s, entity, constraints),
    };
  });

  return new GL.GraphQLObjectType({
    name: "Query",
    fields,
  });
};
