import * as GL from "graphql";
import * as T from "./type";
import * as U from "./utils";

import FetchR from "../main";

import { getQueryFromModel } from "./query-factory";

/**
 *
 * @param def
 * @param ProductQuery
 * @param constraints
 * @returns
 */
export const getSchemaFromModel = (
  def: T.Ddl[],
  fetchR: FetchR,
  constraints?: T.ModelConstraints
): GL.GraphQLSchema => {
  const ddl = U.ddl(def);
  const query = getQueryFromModel(ddl, fetchR, constraints);
  return new GL.GraphQLSchema({ query });
};
