import * as U from "./utils";

test("isstandardtype", () => {
  expect(U.isStandardType("BigDecimal")).toEqual(true);
  expect(U.isStandardType("whatever")).toEqual(false);
});

test("escape", () => {
  const expected = `"a non'safe\\\"string"`;
  expect(U.escape("a non'safe\"string")).toEqual(expected);
});

test("entity to table", () => {
  expect(U.entityToTable({ name: "MyName" })).toEqual("my_name");
});
