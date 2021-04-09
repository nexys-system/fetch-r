import * as U from "./utils";

test("check database type", () => {
  expect(U.isDatabase({})).toEqual(false);
  expect(U.checkDatabase({})).toEqual([
    "database required",
    "username required",
    "password required",
    "host required",
  ]);
});
