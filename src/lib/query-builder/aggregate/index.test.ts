import { Entity } from "../../type";
import * as I from "./index";
import * as T from "./type";

const sql = [
  "SELECT user_module_id, SUM(passed) as sumPassed, COUNT(id) as count_id",
  "FROM user_lesson",
  "WHERE user_module_id IS NOT NULL",
  "GROUP BY user_module_id",
];

// see https://github.com/nexys-system/fetch-r-scala/blob/master/demo/aggregation.ipynb
const params: T.Params = {
  projection: {
    userModule: true,
    passed: { $aggregate: { sumPassed: "$sum" } },
    //# use aggregation without aliasing
    id: { $aggregate: "$count" },
  },
  filters: { userModule: { $neq: null } },
};

const entity = "UserLesson";

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

test("to SQL", () => {
  expect(I.toSQL(entity, params, model)).toEqual(sql.join(" "));
});
