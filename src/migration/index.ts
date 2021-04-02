import * as T from "../type";
import * as Connection from "../connection";
import { RowDataPacket } from "mysql2";
import CRC32 from "crc-32";
import * as U from "./utils";

// manages migration
// inspiration from flyway - https://flywaydb.org/

const table = "flyway_schema_history";

export const runMigrations = async (
  migrations: T.Migration[],
  s: Connection.SQL
) => {
  U.checkSequence(migrations);
  // create table if not exists
  //console.log(createMigrationTable);
  await s.execQuery(U.createMigrationTable);

  // get all migrations
  const r: RowDataPacket[] = await s.execQuery(U.getMigrations);

  const y = r as T.MigrationRow[];

  const l = y.length;

  const lastRow =
    y.length === 0 ? { installed_rank: 0, version: "0.0" } : y[l - 1];

  let lastRank = lastRow.installed_rank;
  let lastVersion = lastRow.version;

  const rows: T.MigrationRow[] = [];

  const pWaitForLoop = migrations.map(async (migration) => {
    const checksum = CRC32.str(migration.sql);
    const t1 = new Date().getTime();
    const rm: { serverStatus: number } = await Promise.resolve({
      serverStatus: 2,
    }); //s.execQuery(migration.sql); OkPacket
    const t2 = new Date().getTime();

    const success = rm.serverStatus;
    const row = U.migrationToRow(
      migration,
      t2 - t1,
      success,
      checksum,
      lastRank
    );
    lastRank += 1;

    rows.push(row);
    return 1;
  });

  const waitForLoop = await Promise.all(pWaitForLoop);

  if (waitForLoop.length !== migrations.length) {
    throw Error("something went wrong while applying migrations");
  }

  console.log(rows);

  return y.map((x) => {
    return { c: x.checksum, d: x.installed_rank };
  });
};
