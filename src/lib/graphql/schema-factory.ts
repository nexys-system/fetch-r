import * as GL from "graphql";

import { Entity } from "../type.js";
import { Connection } from "../database/index.js";
import { DatabaseType } from "../database/type.js";

import * as T from "./type.js";
import * as U from "./utils.js";
import { getQueryFromModel } from "./query-factory.js";
import { getMutation } from "./mutate-factory.js";

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
  databaseType: DatabaseType,
  constraints?: T.ModelConstraints
): GL.GraphQLSchema => {
  const ddl = U.ddl(def);
  const query = getQueryFromModel(ddl, s, databaseType, constraints);
  const mutation = getMutation(def, s);

  return new GL.GraphQLSchema({ query, mutation });
};
