import * as I from "./utils.js";

describe("getOperator", () => {
  test("true", () => {
    expect(I.getOperator("my_column", true)).toEqual("my_column");
  });

  test("count", () => {
    expect(I.getOperator("my_column", { $aggregate: "$count" })).toEqual(
      "COUNT(my_column) as count_my_column"
    );
  });

  test("count with alias", () => {
    expect(
      I.getOperator("my_column", { $aggregate: { myCount: "$count" } })
    ).toEqual("COUNT(my_column) as myCount");
  });
});
