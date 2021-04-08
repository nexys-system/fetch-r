import * as M from "./meta";
import * as TT from "./type";
import * as T from "../type";

import modelAcademy from "./model-academy";
test("2nd level projection", () => {
  const q = {
    ModuleLesson: {
      projection: {
        isMandatory: true,
        position: true,
        module: {
          points: true,
          tag: true,
          status: {},
        },
        lesson: {
          title: true,
        },
      },
      filters: {
        module: {
          tag: {
            id: 2,
          },
        },
      },
    },
  };

  const entity = "ModuleLesson";

  const em = M.toMeta(entity, q[entity], modelAcademy);
  const s = M.toQuery(em);
  const m: TT.MetaQuery = {
    units: [
      {
        entity: "ModuleLesson",
        table: "module_lesson",
        alias: "t0",
        filters: [],
        fields: [
          { name: "id", column: "id" },
          { name: "isMandatory", column: "is_mandatory" },
          { name: "position", column: "position" },
        ],
      },
      {
        entity: "Lesson",
        table: "lesson",
        alias: "t1",
        filters: [],
        fields: [
          { name: "id", column: "id" },
          { name: "title", column: "title" },
        ],
        join: {
          entity: "ModuleLesson",
          field: { name: "lesson", column: "lesson_id", optional: false },
        },
      },
      {
        entity: "Module",
        table: "module",
        alias: "t2",
        filters: [],
        fields: [
          { name: "id", column: "id" },
          { name: "points", column: "points" },
        ],
        join: {
          entity: "ModuleLesson",
          field: { name: "module", column: "module_id", optional: false },
        },
      },
      {
        entity: "ContentStatus",
        table: "content_status",
        alias: "t3",
        filters: [],
        fields: [{ name: "id", column: "id" }],
        join: {
          entity: "Module",
          field: { name: "status", column: "status_id", optional: false },
        },
      },
      {
        entity: "Tag",
        table: "tag",
        alias: "t4",
        filters: [{ name: "id", column: "id", value: 2 }],
        fields: [{ name: "id", column: "id" }],
        join: {
          entity: "Module",
          field: { name: "tag", column: "tag_id", optional: true },
        },
      },
    ],
  };

  const ss = [
    "SELECT t0.`id` AS t0_id, t0.`is_mandatory` AS t0_isMandatory, t0.`position` AS t0_position, t1.`id` AS t1_id, t1.`title` AS t1_title, t2.`id` AS t2_id, t2.`points` AS t2_points, t3.`id` AS t3_id, t4.`id` AS t4_id",
    "FROM module_lesson AS t0",
    "JOIN lesson AS t1 ON t1.id=t0.lesson_id",
    "JOIN module AS t2 ON t2.id=t0.module_id",
    "JOIN content_status AS t3 ON t3.id=t2.status_id",
    "LEFT JOIN tag AS t4 ON t4.id=t2.tag_id",
    "WHERE t4.`id`=2",
  ];

  expect(m).toEqual(em);
  expect(s).toEqual(ss);
});
