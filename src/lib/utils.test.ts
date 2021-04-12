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
