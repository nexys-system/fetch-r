import * as M from "./meta";
import * as S from "./sql";
import * as TT from "./type";

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
  const s = S.toQuery(em);
  const m: TT.MetaQuery = {
    units: [
      {
        entity: "ModuleLesson",
        table: "module_lesson",
        alias: "t0",
        idx: [0, 0],
        filters: [],
        fields: [
          { name: "id", column: "id" },
          { name: "isMandatory", column: "is_mandatory" },
          { name: "position", column: "position" },
        ],
      },
      {
        entity: "Module",
        table: "module",
        alias: "t1",
        idx: [0, 1],
        filters: [],
        fields: [
          { name: "id", column: "id" },
          { name: "points", column: "points" },
        ],
        join: {
          entity: "ModuleLesson",
          entityRef: [0, 0],
          field: { name: "module", column: "module_id", optional: false },
        },
      },
      {
        entity: "Tag",
        table: "tag",
        alias: "t2",
        idx: [0, 2],
        filters: [{ name: "id", column: "id", value: 2, operator: "=" }],
        fields: [{ name: "id", column: "id" }],
        join: {
          entity: "Module",
          entityRef: [0, 1],
          field: { name: "tag", column: "tag_id", optional: true },
        },
      },
      {
        entity: "Lesson",
        table: "lesson",
        alias: "t3",
        idx: [1, 1],
        filters: [],
        fields: [
          { name: "id", column: "id" },
          { name: "title", column: "title" },
        ],
        join: {
          entity: "ModuleLesson",
          entityRef: [0, 0],
          field: { name: "lesson", column: "lesson_id", optional: false },
        },
      },

      {
        entity: "ContentStatus",
        table: "content_status",
        alias: "t4",
        idx: [1, 2],
        filters: [],
        fields: [{ name: "id", column: "id" }],
        join: {
          entity: "Module",
          entityRef: [0, 1],
          field: { name: "status", column: "status_id", optional: false },
        },
      },
    ],
  };

  const ss = [
    "SELECT t0.`id` AS t0_id, t0.`is_mandatory` AS t0_isMandatory, t0.`position` AS t0_position, t1.`id` AS t1_id, t1.`points` AS t1_points, t2.`id` AS t2_id, t3.`id` AS t3_id, t3.`title` AS t3_title, t4.`id` AS t4_id",
    "FROM module_lesson AS t0",
    "JOIN module AS t1 ON t1.id=t0.module_id",
    "LEFT JOIN tag AS t2 ON t2.id=t1.tag_id",
    "JOIN lesson AS t3 ON t3.id=t0.lesson_id",
    "JOIN content_status AS t4 ON t4.id=t1.status_id",
    "WHERE t2.`id`=2",
  ];

  expect(m).toEqual(em);
  expect(s).toEqual(ss);
});

test("$neq", () => {
  const q = {
    UserCertificate: {
      filters: {
        badgeId: {
          $ne: null,
        },
      },
    },
  };

  const em = M.createQuery(q, modelAcademy);

  const s = [
    "SELECT t0.`id` AS t0_id, t0.`issued` AS t0_issued, t0.`printed` AS t0_printed, t0.`score` AS t0_score, t0.`expires` AS t0_expires, t0.`log_date_added` AS t0_logDateAdded, t0.`test_user_id` AS t0_testUserId, t0.`reason` AS t0_reason, t0.`badge_status` AS t0_badgeStatus, t0.`is_log` AS t0_isLog, t0.`badge_id` AS t0_badgeId, t0.`log_comment` AS t0_logComment, t1.`id` AS t1_id, t2.`id` AS t2_id, t3.`id` AS t3_id, t4.`id` AS t4_id",
    "FROM user_certificate AS t0",
    "JOIN user AS t1 ON t1.id=t0.user_id",
    "LEFT JOIN user AS t2 ON t2.id=t0.log_user_id",
    "JOIN cert AS t3 ON t3.id=t0.cert_id",
    "JOIN user_certificate_status AS t4 ON t4.id=t0.status_id",
    "WHERE t0.`badge_id` IS NOT NULL;",
  ];

  expect(em[0].sql).toEqual(s.join("\n"));
});

test("is null", () => {
  const q = {
    UserCertificate: {
      filters: {
        badgeId: null,
      },
    },
  };

  const s = [
    "SELECT t0.`id` AS t0_id, t0.`issued` AS t0_issued, t0.`printed` AS t0_printed, t0.`score` AS t0_score, t0.`expires` AS t0_expires, t0.`log_date_added` AS t0_logDateAdded, t0.`test_user_id` AS t0_testUserId, t0.`reason` AS t0_reason, t0.`badge_status` AS t0_badgeStatus, t0.`is_log` AS t0_isLog, t0.`badge_id` AS t0_badgeId, t0.`log_comment` AS t0_logComment, t1.`id` AS t1_id, t2.`id` AS t2_id, t3.`id` AS t3_id, t4.`id` AS t4_id",
    "FROM user_certificate AS t0",
    "JOIN user AS t1 ON t1.id=t0.user_id",
    "LEFT JOIN user AS t2 ON t2.id=t0.log_user_id",
    "JOIN cert AS t3 ON t3.id=t0.cert_id",
    "JOIN user_certificate_status AS t4 ON t4.id=t0.status_id",
    "WHERE t0.`badge_id` IS NULL;",
  ];

  const em = M.createQuery(q, modelAcademy);

  expect(em[0].sql).toEqual(s.join("\n"));
});
