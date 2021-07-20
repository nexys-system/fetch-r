import { Entity } from "../../type";
import * as I from "./index";
import * as T from "./type";

const sql = [
  "SELECT user_module_id, SUM(passed) as sumPassed, COUNT(id) as count_id",
  "FROM user_lesson",
  "GROUP BY user_module_id",
];

// see https://github.com/nexys-system/fetch-r-scala/blob/master/demo/aggregation.ipynb
const q: T.Query = {
  UserLesson: {
    projection: {
      userModule: true,
      passed: { $aggregate: { sumPassed: "$sum" } },
      //# use aggregation without aliasing
      id: { $aggregate: "$count" },
    },
  },
};

const model: Entity[] = [
  {
    uuid: false,
    name: "UserLesson",
    fields: [
      { name: "passed", type: "number", optional: false },
      {
        name: "userModule",
        column: "user_module_id",
        type: "UserModule",
        optional: false,
      },
    ],
  },
];

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

test("to SQL", () => {
  expect(I.toSQL(q, model)[0]).toEqual(sql.join(" "));
});
