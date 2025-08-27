import * as U from "./utils.js";
import { expect, test } from "bun:test";

test("isstandardtype", () => {
  expect(U.isStandardType("BigDecimal")).toEqual(true);
  expect(U.isStandardType("Float")).toEqual(true);
  expect(U.isStandardType("Double")).toEqual(true);
  expect(U.isStandardType("whatever")).toEqual(false);
});

test("escape", () => {
  const expected = `'a non\\\'safe\\\"string'`;
  expect(U.escape("a non'safe\"string")).toEqual(expected);
});

test("entity to table", () => {
  expect(U.entityToTable({ name: "MyName" })).toEqual("my_name");
});

test("field to col", () => {
  expect(U.fieldToColumn({ name: "MyName" })).toEqual("my_name");
});

test("find field", () => {
  expect(
    U.findField(
      {
        name: "MyName",
        fields: [
          {
            type: "String",
            name: "MyFieldName",
            column: "my_column",
            optional: false,
          },
        ],
        uuid: false,
      },
      "MyFieldName"
    )
  ).toEqual({
    name: "MyFieldName",
    column: "my_column",
    optional: false,
    type: "String",
  });
});

test("camelToSnakeCase", () => {
  expect(U.camelToSnakeCase("isCamelCase")).toEqual("is_camel_case");
});

test("array filter null and undefined using predicate", () => {
  const a: (string | undefined | null)[] = [
    "a",
    null,
    "b",
    undefined,
    "c",
    null,
  ];
  const b: string[] = ["a", "b", "c"];
  const c: string[] = a.filter(U.arrayNotEmpty);

  expect(c).toEqual(b);
});
