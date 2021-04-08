import * as Connection from "./database/connection";
import * as Exec from "./exec";
import * as T from "./type";

const s = Connection.init();

export const run = async (query: T.Query, model: T.Entity[]): Promise<any> =>
  Exec.exec(query, model, s);

export const mutate = async (
  query: T.Mutate,
  model: T.Entity[]
): Promise<any> => Exec.mutate(query, model, s);
