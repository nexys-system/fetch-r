// this file is used for the package. The server should use the other files directly
import * as Connection from "./database/connection";
import { Database } from "./database/type";
import * as Exec from "./exec";
import * as T from "./type";
import * as MigrationService from "./migration";
import { Migration } from "./migration/type";
export { Connection };

export class Main {
  s: Connection.SQL;
  model: T.Entity[];

  constructor(c: Database, model: T.Entity[]) {
    this.s = new Connection.SQL(
      c.host,
      c.username,
      c.password,
      c.database,
      c.port
    );
    this.model = model;
  }

  mutate = (m: T.Mutate) => Exec.mutate(m, this.model, this.s);

  query = (q: T.Query) => Exec.exec(q, this.model, this.s);

  applyMigration = (migrations: Migration[]) =>
    MigrationService.runMigrations(migrations, this.s);
}

export default Main;
