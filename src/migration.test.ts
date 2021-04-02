import * as M from "./migration";
import * as T from "./type";
import * as Connection from "./connection";

// see https://stackoverflow.com/a/54175600/1659569 (because of mysql2)
require("iconv-lite").encodingExists("foo");

const s = Connection.init();

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
