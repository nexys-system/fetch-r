import * as M from "./utils";

describe("check sequence", () => {
  test("right seq", () => {
    const s = [{ version: 0, idx: 1 }];

    expect(M.checkSequence(s)).toEqual(undefined);
  });

  test("right seq2", () => {
    const s = [
      { version: 0, idx: 1 },
      { version: 0, idx: 2 },
      { version: 1, idx: 1 },
      { version: 1, idx: 3 },
      { version: 2, idx: 2 },
    ];

    expect(M.checkSequence(s)).toEqual(undefined);
  });

  test("wrong versions", () => {
    const s = [
      { version: 0, idx: 1 },
      { version: 0, idx: 2 },
      { version: 2, idx: 1 },
      { version: 1, idx: 3 },
      { version: 2, idx: 2 },
    ];

    try {
      M.checkSequence(s);
    } catch (err) {
      expect(typeof err).toEqual("object");
    }
  });
});

test("to version", () => {
  expect(M.toVersion(2, 4)).toEqual("2.4");
});

test("to script", () => {
  expect(M.toScript("2.4", "myname")).toEqual("v2_4__myname.sql");
});

test("migration to sql", () => {
  const row = M.migrationToRow(
    "myname",
    "2.3",
    123,
    1,
    1234567,
    2,
    "admin",
    new Date(2021, 12, 1, 13, 45)
  );

  expect(M.migrationsToSQL([row])).toEqual(
    "INSERT INTO `flyway_schema_history` (`installed_rank`, `version`, `description`, `type`, `script`, `checksum`, `installed_by`, `installed_on`, `execution_time`, `success`) VALUES (2, 2.3, 'myname', 'SQL', 'v2_3__myname.sql', 1234567, 'admin', '2022-01-01 13:45:00', 123, 1);"
  );
});

test("checksum", () => {
  const cs = -1064643516;
  const s =
    "CREATE TABLE `user` (`id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, `uuid` VARCHAR(64) NOT NULL, `first_name` VARCHAR(512) NOT NULL, `last_name` VARCHAR(512) NOT NULL, `email` VARCHAR(512) NOT NULL, `status_id` BIGINT NOT NULL, `log_date_added` DATETIME NOT NULL DEFAULT NOW(), `instance_id` BIGINT NOT NULL, `lang` VARCHAR(512) NOT NULL);";
  expect(M.getChecksum(s)).toEqual(cs);
});

describe("find previous migrations", () => {
  const y = [{ version: "2.1", checksum: 123 }];

  test("does not exist", () => {
    expect(M.findPreviousMigrations("2.2", 23, y)).toEqual(false);
  });

  test("already exists", () => {
    expect(M.findPreviousMigrations("2.1", 123, y)).toEqual(true);
  });

  test("already exists but different checksum", () => {
    try {
      M.findPreviousMigrations("2.1", 43, y);
    } catch (err) {
      expect(typeof err).toEqual("object");
    }
  });
});

test("get last row", () => {
  expect(M.getLastRow([])).toEqual({ installed_rank: 0 });
  expect(M.getLastRow([{ installed_rank: 1 }, { installed_rank: 2 }])).toEqual({
    installed_rank: 2,
  });
});
