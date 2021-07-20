import * as M from "./meta";
import * as S from "./sql";

import modelAcademy from "./model-academy";
import { MetaQuery, MetaQueryUnit } from "./type";

const u0: MetaQueryUnit = {
  entity: "UserCertificate",
  table: "user_certificate",
  filters: [],
  fields: [
    { name: "id", column: "id" },
    { name: "issued", column: "issued" },
    { name: "printed", column: "printed" },
    { name: "score", column: "score" },
    { name: "expires", column: "expires" },
    { name: "logDateAdded", column: "log_date_added" },
    { name: "testUserId", column: "test_user_id" },
    { name: "reason", column: "reason" },
    { name: "badgeStatus", column: "badge_status" },
    { name: "isLog", column: "is_log" },
    { name: "badgeId", column: "badge_id" },
    { name: "logComment", column: "log_comment" },
  ],
  alias: "t0",
  idx: [0, 0],
};

const u1: MetaQueryUnit = {
  entity: "Cert",
  table: "cert",
  filters: [],
  fields: [
    { name: "id", column: "id" },
    { name: "logDateAdded", column: "log_date_added" },
    { name: "badge", column: "badge_id" },
    { name: "points", column: "points" },
  ],
  join: {
    entity: "UserCertificate",
    entityRef: [0, 0],
    field: { name: "cert", column: "cert_id", optional: false },
  },
  alias: "t1",
  idx: [0, 1],
};

const u2: MetaQueryUnit = {
  entity: "User",
  table: "user",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "Cert",
    entityRef: [0, 1],
    field: { name: "logUser", column: "log_user_id", optional: true },
  },
  alias: "t2",
  idx: [0, 2],
};

const u3: MetaQueryUnit = {
  entity: "User",
  table: "user",
  filters: [],
  fields: [
    { name: "id", column: "id" },
    { name: "secretKey", column: "keyy" },
    { name: "email", column: "email" },
    { name: "firstName", column: "first_name" },
    { name: "password", column: "password_bcrypt" },
    { name: "logIp", column: "log_ip" },
    { name: "simulcationUser", column: "simulcation_user_id" },
    { name: "logDateAdded", column: "log_date_added" },
    { name: "lastName", column: "last_name" },
    { name: "isAdmin", column: "is_admin" },
    { name: "status", column: "status_id" },
    { name: "language", column: "language_id" },
    { name: "kyiId", column: "kyi_id" },
  ],
  join: {
    entity: "UserCertificate",
    entityRef: [0, 0],
    field: { name: "user", column: "user_id", optional: false },
  },
  alias: "t3",
  idx: [1, 1],
};

const u4: MetaQueryUnit = {
  entity: "ContentStatus",
  table: "content_status",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "Cert",
    entityRef: [0, 1],
    field: { name: "status", column: "status_id", optional: false },
  },
  alias: "t4",
  idx: [1, 2],
};

const u5: MetaQueryUnit = {
  entity: "Company",
  table: "company",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "User",
    entityRef: [1, 1],
    field: { name: "company", column: "company_id", optional: true },
  },
  alias: "t5",
  idx: [1, 2],
};

const u6: MetaQueryUnit = {
  entity: "User",
  table: "user",
  filters: [],
  fields: [
    { name: "id", column: "id" },
    { name: "secretKey", column: "keyy" },
    { name: "email", column: "email" },
    { name: "firstName", column: "first_name" },
    { name: "password", column: "password_bcrypt" },
    { name: "logIp", column: "log_ip" },
    { name: "simulcationUser", column: "simulcation_user_id" },
    { name: "logDateAdded", column: "log_date_added" },
    { name: "lastName", column: "last_name" },
    { name: "isAdmin", column: "is_admin" },
    { name: "status", column: "status_id" },
    { name: "language", column: "language_id" },
    { name: "kyiId", column: "kyi_id" },
  ],
  join: {
    entity: "UserCertificate",
    entityRef: [0, 0],
    field: { name: "logUser", column: "log_user_id", optional: true },
  },
  alias: "t6",
  idx: [2, 1],
};

const u7: MetaQueryUnit = {
  entity: "Country",
  table: "country",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "User",
    entityRef: [1, 1],
    field: { name: "country", column: "country_id", optional: false },
  },
  alias: "t7",
  idx: [2, 2],
};

const u8: MetaQueryUnit = {
  entity: "Company",
  table: "company",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "User",
    entityRef: [2, 1],
    field: { name: "company", column: "company_id", optional: true },
  },
  alias: "t8",
  idx: [2, 2],
};

const u9: MetaQueryUnit = {
  entity: "UserCertificateStatus",
  table: "user_certificate_status",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "UserCertificate",
    entityRef: [0, 0],
    field: { name: "status", column: "status_id", optional: false },
  },
  alias: "t9",
  idx: [3, 1],
};

const u10: MetaQueryUnit = {
  entity: "Country",
  table: "country",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "User",
    entityRef: [2, 1],
    field: { name: "country", column: "country_id", optional: true },
  },
  alias: "t10",
  idx: [3, 2],
};

const units: MetaQueryUnit[] = [u0, u1, u2, u3, u4, u5, u6, u7, u8, u9, u10];

const metaExpected: MetaQuery = {
  units,
  take: 3,
};

const entity = "UserCertificate";
const userAttributes = {
  secretKey: true,
  email: true,
  firstName: true,
  password: true,
  logIp: true,
  simulcationUser: true,
  logDateAdded: true,
  lastName: true,
  isAdmin: true,
  company: true,
  status: true,
  language: true,
  kyiId: true,
  country: true,
};
const projection = {
  cert: {
    logDateAdded: true,
    logUser: true,
    status: true,
    badge: true,
    points: true,
  },
  user: userAttributes,
  logUser: userAttributes,
  issued: true,
  printed: true,
  score: true,
  expires: true,
  logDateAdded: true,
  testUserId: true,
  reason: true,
  badgeStatus: true,
  isLog: true,
  status: true,
  badgeId: true,
  logComment: true,
};
const params = {
  projection,
  take: 3,
};

//const q = { [entity]: params };

describe("multiple joins", () => {
  test("meta", () => {
    const meta = M.toMeta(entity, params, modelAcademy);
    expect(meta).toEqual(metaExpected);
  });

  test("sql", () => {
    /*const s0 =
      "t0.`id` AS t0_id, t0.`issued` AS t0_issued, t0.`printed` AS t0_printed, t0.`score` AS t0_score, t0.`expires` AS t0_expires, t0.`log_date_added` AS t0_logDateAdded, t0.`test_user_id` AS t0_testUserId, t0.`reason` AS t0_reason, t0.`badge_status` AS t0_badgeStatus, t0.`is_log` AS t0_isLog, t0.`badge_id` AS t0_badgeId, t0.`log_comment` AS t0_logComment";
    const s1 = "t1.`id` AS t1_id";
    const s10 = "t10.`id` AS t10_id";
    const s2 =
      "t2.`id` AS t2_id, t2.`keyy` AS t2_secretKey, t2.`email` AS t2_email, t2.`first_name` AS t2_firstName, t2.`password_bcrypt` AS t2_password, t2.`log_ip` AS t2_logIp, t2.`simulcation_user_id` AS t2_simulcationUser, t2.`log_date_added` AS t2_logDateAdded, t2.`last_name` AS t2_lastName, t2.`is_admin` AS t2_isAdmin, t2.`status_id` AS t2_status, t2.`language_id` AS t2_language, t2.`kyi_id` AS t2_kyiId";
    const s3 = "t3.`id` AS t3_id";
    const s4 = "t4.`id` AS t4_id";
    const s5 =
      "t5.`id` AS t5_id, t5.`keyy` AS t5_secretKey, t5.`email` AS t5_email, t5.`first_name` AS t5_firstName, t5.`password_bcrypt` AS t5_password, t5.`log_ip` AS t5_logIp, t5.`simulcation_user_id` AS t5_simulcationUser, t5.`log_date_added` AS t5_logDateAdded, t5.`last_name` AS t5_lastName, t5.`is_admin` AS t5_isAdmin, t5.`status_id` AS t5_status, t5.`language_id` AS t5_language, t5.`kyi_id` AS t5_kyiId";
    const s6 = "t6.`id` AS t6_id";
    const s7 = "t7.`id` AS t7_id";
    const s8 =
      "t8.`id` AS t8_id, t8.`log_date_added` AS t8_logDateAdded, t8.`badge_id` AS t8_badge, t8.`points` AS t8_points";
    const s9 = "t9.`id` AS t9_id";

    const select = [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].join(", ");*/

    /* const s23 = [
      "SELECT " + select,
      "FROM user_certificate AS t0",
      "JOIN user_certificate_status AS t1 ON t1.id=t0.status_id",
      "LEFT JOIN user AS t2 ON t2.id=t0.log_user_id",
      "LEFT JOIN country AS t3 ON t3.id=t2.country_id", // here there is a left join because the parent join is optional. See `isParentJoinOptional` in code
      "LEFT JOIN company AS t4 ON t4.id=t2.company_id",
      "JOIN user AS t5 ON t5.id=t0.user_id",
      "JOIN country AS t6 ON t6.id=t2.country_id",
      "LEFT JOIN company AS t7 ON t7.id=t2.company_id",
      "JOIN cert AS t8 ON t8.id=t0.cert_id",
      "JOIN content_status AS t9 ON t9.id=t8.status_id",
      "LEFT JOIN user AS t10 ON t10.id=t8.log_user_id",
      "WHERE 1",
      "LIMIT 0, 3",
    ];*/

    const s = [
      "SELECT t0.`id` AS t0_id, t0.`issued` AS t0_issued, t0.`printed` AS t0_printed, t0.`score` AS t0_score, t0.`expires` AS t0_expires, t0.`log_date_added` AS t0_logDateAdded, t0.`test_user_id` AS t0_testUserId, t0.`reason` AS t0_reason, t0.`badge_status` AS t0_badgeStatus, t0.`is_log` AS t0_isLog, t0.`badge_id` AS t0_badgeId, t0.`log_comment` AS t0_logComment, t1.`id` AS t1_id, t1.`log_date_added` AS t1_logDateAdded, t1.`badge_id` AS t1_badge, t1.`points` AS t1_points, t2.`id` AS t2_id, t3.`id` AS t3_id, t3.`keyy` AS t3_secretKey, t3.`email` AS t3_email, t3.`first_name` AS t3_firstName, t3.`password_bcrypt` AS t3_password, t3.`log_ip` AS t3_logIp, t3.`simulcation_user_id` AS t3_simulcationUser, t3.`log_date_added` AS t3_logDateAdded, t3.`last_name` AS t3_lastName, t3.`is_admin` AS t3_isAdmin, t3.`status_id` AS t3_status, t3.`language_id` AS t3_language, t3.`kyi_id` AS t3_kyiId, t4.`id` AS t4_id, t5.`id` AS t5_id, t6.`id` AS t6_id, t6.`keyy` AS t6_secretKey, t6.`email` AS t6_email, t6.`first_name` AS t6_firstName, t6.`password_bcrypt` AS t6_password, t6.`log_ip` AS t6_logIp, t6.`simulcation_user_id` AS t6_simulcationUser, t6.`log_date_added` AS t6_logDateAdded, t6.`last_name` AS t6_lastName, t6.`is_admin` AS t6_isAdmin, t6.`status_id` AS t6_status, t6.`language_id` AS t6_language, t6.`kyi_id` AS t6_kyiId, t7.`id` AS t7_id, t8.`id` AS t8_id, t9.`id` AS t9_id, t10.`id` AS t10_id",
      "FROM user_certificate AS t0",
      "JOIN cert AS t1 ON t1.id=t0.cert_id",
      "LEFT JOIN user AS t2 ON t2.id=t1.log_user_id",
      "JOIN user AS t3 ON t3.id=t0.user_id",
      "JOIN content_status AS t4 ON t4.id=t1.status_id",
      "LEFT JOIN company AS t5 ON t5.id=t3.company_id",
      "LEFT JOIN user AS t6 ON t6.id=t0.log_user_id",
      "JOIN country AS t7 ON t7.id=t3.country_id",
      "LEFT JOIN company AS t8 ON t8.id=t6.company_id",
      "JOIN user_certificate_status AS t9 ON t9.id=t0.status_id",
      "LEFT JOIN country AS t10 ON t10.id=t6.country_id",
      "WHERE 1",
      "LIMIT 0, 3",
    ];

    const pSQL = S.toQuery(metaExpected);

    expect(pSQL).toEqual(s);
  });
});
