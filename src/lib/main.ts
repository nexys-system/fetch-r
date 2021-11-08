// this file is used for the package. The server should use the other files directly
import * as Connection from "./database/connection";
import { Database } from "./database/type";
import * as Exec from "./exec";
import * as T from "./type";
import * as MigrationService from "@nexys/sql-migrations";
import { addColumnsToModel } from "./model/utils";

interface Options{ legacyMode: boolean }

export class Main {
  s: Connection.SQL;
  model: T.Entity[];
  options: Options

  constructor(c: Database, model: T.Entity[], options: Options = { legacyMode: false }) {
    this.s = new Connection.SQL(
      c.host,
      c.username,
      c.password,
      c.database,
      c.port
    );

    addColumnsToModel(model);
    this.model = model;
    this.options = options;
  }

  mutate = (m: T.Mutate) => Exec.mutate(m, this.model, this.s);

  query = (q: T.Query) => Exec.exec(q, this.model, this.s, this.options);

  applyMigration = (migrations: MigrationService.Type.Migration[]) =>
    MigrationService.Migrations.runMigrations(migrations, this.s);
}

export default Main;
