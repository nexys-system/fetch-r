import * as T from "./type";
import * as Connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import CRC32 from "crc-32";

// manages migration
// inspiration from flyway - https://flywaydb.org/

const table = "flyway_schema_history";

const createMigrationTable = [
  "CREATE TABLE IF NOT EXISTS `" + table + "` (",
  "`installed_rank` int NOT NULL,",
  " `version` varchar(50) DEFAULT NULL,",
  " `description` varchar(200) NOT NULL,",
  " `type` varchar(20) NOT NULL,",
  " `script` varchar(1000) NOT NULL,",
  " `checksum` int DEFAULT NULL,",
  " `installed_by` varchar(100) NOT NULL,",
  " `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,",
  " `execution_time` int NOT NULL,",
  " `success` tinyint(1) NOT NULL,",
  " PRIMARY KEY (`installed_rank`),",
  " KEY `flyway_schema_history_s_idx` (`success`)",
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
].join("\n");

const getMigrations = `SELECT * FROM ${table};`;

const migrationToRow = (
  m: T.Migration,
  execution_time: number,
  success: number,
  checksum: number,
  lastRank: number
) => {
  const installed_rank = lastRank + 1;
  const version = m.version + "." + m.idx;
  const versionString = version.replace(".", "_");
  const script = `${versionString}__${m.name}.sql`;

  const type = "SQL";
  const row: T.MigrationRow = {
    installed_by: "admin",
    execution_time,
    installed_on: new Date(),
    description: m.name,
    checksum,
    installed_rank,
    script,
    version,
    success,
    type,
  };

  return row;
};

export const checkSequence = (
  migrations: Pick<T.Migration, "idx" | "version">[]
): void => {
  // check order
  let iIdx = 0;
  let iVersion = 0;
  migrations.forEach((migration) => {
    // observed version is greater than ref version
    if (migration.version > iVersion) {
      iVersion = migration.version;
      return;
    }

    if (migration.version === iVersion) {
      // observed idx is greater than ref idx
      if (migration.idx > iIdx) {
        iIdx = migration.idx;
        return;
      }
    }

    throw Error("input migrations are not in sequence");
  });
};

export const runMigrations = async (
  migrations: T.Migration[],
  s: Connection.SQL
) => {
  checkSequence(migrations);
  // create table if not exists
  console.log(createMigrationTable);
  await s.execQuery(createMigrationTable);

  // get all migrations
  const r: RowDataPacket[] = await s.execQuery(getMigrations);

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
    const row = migrationToRow(migration, t2 - t1, success, checksum, lastRank);
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
