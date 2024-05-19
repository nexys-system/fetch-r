// this file is used for the package. The server should use the other files directly
import * as Connection from "./database/connection.js";
import * as Exec from "./exec.js";
import * as T from "./type.js";
import { addColumnsToModel } from "./model/utils.js";
import { Query as AQuery } from "./query-builder/aggregate/type.js";
import { Aggregate } from "./query-builder/index.js";
import { ConnectionOptions, DatabaseType } from "./database/type.js";

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

  mutate = (m: T.Mutate) =>
    Exec.mutate(m, this.model, this.s, this.databaseType);

  query = (q: T.Query) => Exec.exec(q, this.model, this.s, this.databaseType);

  aggregate = (q: AQuery) => Aggregate.exec(q, this.model, this.s);
}

export default Main;
