import * as Connection from "./database/connection";
import * as Exec from "./exec";
import * as T from "./type";

export const run = async (
  query: T.Query,
  model: T.Entity[],
  connectionPool: Connection.SQL
): Promise<T.ReturnUnit> => Exec.exec(query, model, connectionPool);

export const mutate = async (
  query: T.Mutate,
  model: T.Entity[],
  connectionPool: Connection.SQL
): Promise<any> => Exec.mutate(query, model, connectionPool);
