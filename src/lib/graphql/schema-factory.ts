import * as GL from "graphql";
import * as T from "./type";
import * as U from "./utils";

import { Entity } from "../type";
import { Connection } from "../database";
import {
  getQueryFromModel,
  //getMutateFromModel
} from "./query-factory";

/**
 *
 * @param def
 * @param ProductQuery
 * @param constraints
 * @returns
 */
export const getSchemaFromModel = (
  def: Entity[],
  s: Connection.SQL,
  constraints?: T.ModelConstraints
): GL.GraphQLSchema => {
  const ddl = U.ddl(def);
  const query = getQueryFromModel(ddl, s, constraints);
  // const mutation = getMutateFromModel(ddl, s, constraints);
  return new GL.GraphQLSchema({ query });
};
