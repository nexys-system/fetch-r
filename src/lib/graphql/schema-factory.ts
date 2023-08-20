import * as GL from "graphql";

import { Entity } from "../type";
import { Connection } from "../database";
import { DatabaseType } from "../database/type";

import * as T from "./type";
import * as U from "./utils";
import { getQueryFromModel } from "./query-factory";
import { getMutation } from "./mutate-factory";

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
