import * as T from "./type";
import * as Connection from "../connection";
import { OkPacket, RowDataPacket } from "mysql2";

import * as U from "./utils";

const getLastRow = (y: T.MigrationRow[]): { installed_rank: number } => {
  const l = y.length;

  if (y.length === 0) {
    return { installed_rank: 0 };
  }

  const { installed_rank } = y[l - 1];

  return { installed_rank };
};

// manages migration
// inspiration from flyway - https://flywaydb.org/
export const runMigrations = async (
  migrations: T.Migration[],
  s: Connection.SQL
) => {
  U.checkSequence(migrations);
  // create table if not exists
  //console.log(createMigrationTable);
  await s.execQuery(U.createMigrationTable);

  // get all migrations
  const [r] = await s.execQuery(U.getMigrations);
  const y = (r as RowDataPacket[]) as T.MigrationRow[];

  const lastRow = getLastRow(y);

  let lastRank = lastRow.installed_rank;

  const rows: T.MigrationRow[] = [];

  const pWaitForLoop = migrations.map(async (migration) => {
    const version = U.toVersion(migration.version, migration.idx);
    const checksum = U.getChecksum(migration.sql);

    // find previous migration with szme version and compare checksums
    if (U.findPreviousMigrations(version, checksum, y)) {
      return;
    }

    const t1 = new Date().getTime();
    const [rm] = await s.execQuery(migration.sql);
    const t2 = new Date().getTime();

    const success = (rm as OkPacket).serverStatus;
    const row = U.migrationToRow(
      migration.name,
      version,
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
