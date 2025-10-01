import { Entity } from "../../type.js";
import * as I from "./index.js";
import * as T from "./type.js";

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

// Test for issue #42: nested filters in aggregate queries
test("to SQL with nested filter", () => {
  const modelWithLesson: Entity[] = [
    {
      uuid: false,
      name: "UserLesson",
      fields: [
        { name: "passed", type: "Boolean", optional: false },
        {
          name: "lesson",
          column: "lesson_id",
          type: "Lesson",
          optional: false,
        },
      ],
    },
    {
      uuid: false,
      name: "Lesson",
      fields: [
        { name: "title", type: "String", optional: false },
        { name: "testPassrate", column: "test_passrate", type: "Int", optional: true },
      ],
    },
  ];

  const paramsWithNestedFilter: T.Params = {
    projection: {
      passed: true,
      lesson: true,
      id: { $aggregate: "$count" },
    },
    filters: {
      passed: true,
      lesson: {
        testPassrate: { $ne: null },
      },
    },
  };

  const expectedSQL = [
    "SELECT passed, lesson_id, COUNT(id) as count_id",
    "FROM user_lesson",
    "JOIN lesson ON lesson.id=user_lesson.lesson_id",
    "WHERE passed=true AND lesson.test_passrate IS NOT NULL",
    "GROUP BY passed, lesson_id",
  ].join(" ");

  expect(I.toSQL("UserLesson", paramsWithNestedFilter, modelWithLesson)).toEqual(expectedSQL);
});
