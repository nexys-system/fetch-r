// this file is used for the package. The server should use the other files directly
import * as Connection from "./database/connection";
import * as Exec from "./exec";
import * as T from "./type";
import { addColumnsToModel } from "./model/utils";
import { Query as AQuery } from "./query-builder/aggregate/type";
import { Aggregate } from "./query-builder";
import { ConnectionOptions, DatabaseType } from "./database/type";

interface Options {
  legacyMode: boolean;
}

export class Main {
  s: Connection.SQL;
  model: T.Entity[];
  options: Options;
  databaseType: DatabaseType;

  constructor(
    c: ConnectionOptions,
    databaseType: DatabaseType,
    model: T.Entity[],
    options: Options = { legacyMode: false }
  ) {
    this.s = new Connection.SQL(c, databaseType);
    this.databaseType = databaseType;

    addColumnsToModel(model);
    this.model = model;
    this.options = options;
  }

  mutate = (m: T.Mutate) => Exec.mutate(m, this.model, this.s);

  query = (q: T.Query) => Exec.exec(q, this.model, this.s, this.databaseType);

  aggregate = (q: AQuery) => Aggregate.exec(q, this.model, this.s);
}

export default Main;
