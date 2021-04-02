import * as T from "../type";
import * as Connection from "../connection";
import { RowDataPacket } from "mysql2";
import CRC32 from "crc-32";

// manages migration
// inspiration from flyway - https://flywaydb.org/

const table = "flyway_schema_history";

export const createMigrationTable = [
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

export const getMigrations = `SELECT * FROM ${table};`;

export const migrationToRow = (
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
