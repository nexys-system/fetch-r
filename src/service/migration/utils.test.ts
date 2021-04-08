import * as M from "./utils";

// see https://stackoverflow.com/a/54175600/1659569 (because of mysql2)
//require("iconv-lite").encodingExists("foo");

//const s = Connection.init();

/*test("creat table", async () => {
  s.connection.connect();
  const migrations: T.Migration[] = [
    { sql: "fdsa", version: 1, idx: 1, name: "first" },
    { sql: "fdsa2", version: 1, idx: 2, name: "second" },
  ];
  expect(await M.runMigrations(migrations, s)).toEqual({});
  s.connection.end();
});*/

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

test("checksum", () => {
  const cs = -1064643516;
  const s =
    "CREATE TABLE `user` (`id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, `uuid` VARCHAR(64) NOT NULL, `first_name` VARCHAR(512) NOT NULL, `last_name` VARCHAR(512) NOT NULL, `email` VARCHAR(512) NOT NULL, `status_id` BIGINT NOT NULL, `log_date_added` DATETIME NOT NULL DEFAULT NOW(), `instance_id` BIGINT NOT NULL, `lang` VARCHAR(512) NOT NULL);";
  expect(M.getChecksum(s)).toEqual(cs);
});

describe("find previsou migrations", () => {
  const y = [{ version: "2.1", checksum: 123 }];

  test("does not exist", () => {
    expect(M.findPreviousMigrations("2.2", 23, y)).toEqual(false);
  });

  test("already exists", () => {
    expect(M.findPreviousMigrations("2.1", 123, y)).toEqual(true);
  });

  test("already exists but checksum different", () => {
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
