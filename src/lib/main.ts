// this file is used for the package. The server should use the other files directly
import * as Connection from "./database/connection";
import * as Exec from "./exec";
import * as T from "./type";
import { addColumnsToModel } from "./model/utils";
import { Query as AQuery } from "./query-builder/aggregate/type";
import { Aggregate } from "./query-builder";

interface Options {
  legacyMode: boolean;
}

export class Main {
  s: Connection.SQL;
  model: T.Entity[];
  options: Options;

  constructor(
    c: Connection.ConnectionOptions,
    model: T.Entity[],
    options: Options = { legacyMode: false }
  ) {
    this.s = new Connection.SQL(c);

    addColumnsToModel(model);
    this.model = model;
    this.options = options;
  }

  mutate = (m: T.Mutate) => Exec.mutate(m, this.model, this.s);

  query = (q: T.Query) => Exec.exec(q, this.model, this.s, this.options);

  aggregate = (q: AQuery) => Aggregate.exec(q, this.model, this.s);
}

export default Main;
