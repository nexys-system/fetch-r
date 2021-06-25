import * as M from "./meta";
import * as S from "./sql";

import modelAcademy from "./model-academy";

const u0 = {
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
};

const u1 = {
  entity: "UserCertificateStatus",
  table: "user_certificate_status",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "UserCertificate",
    field: { name: "status", column: "status_id", optional: false },
  },
  alias: "t1",
};

const u10 = {
  entity: "User",
  table: "user",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "Cert",
    field: { name: "logUser", column: "log_user_id", optional: true },
  },
  alias: "t10",
};

const u2 = {
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
    field: { name: "logUser", column: "log_user_id", optional: true },
  },
  alias: "t2",
};

const u3 = {
  entity: "Country",
  table: "country",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "User",
    field: { name: "country", column: "country_id", optional: false },
  },
  alias: "t3",
};

const u4 = {
  entity: "Company",
  table: "company",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "User",
    field: { name: "company", column: "company_id", optional: true },
  },
  alias: "t4",
};

const u5 = {
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
    field: { name: "user", column: "user_id", optional: false },
  },
  alias: "t5",
};

const u6 = {
  entity: "Country",
  table: "country",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "User",
    field: { name: "country", column: "country_id", optional: false },
  },
  alias: "t6",
};

const u7 = {
  entity: "Company",
  table: "company",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "User",
    field: { name: "company", column: "company_id", optional: true },
  },
  alias: "t7",
};

const u8 = {
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
    field: { name: "cert", column: "cert_id", optional: false },
  },
  alias: "t8",
};

const u9 = {
  entity: "ContentStatus",
  table: "content_status",
  filters: [],
  fields: [{ name: "id", column: "id" }],
  join: {
    entity: "Cert",
    field: { name: "status", column: "status_id", optional: false },
  },
  alias: "t9",
};

const units = [u0, u1, u2, u3, u4, u5, u6, u7, u8, u9, u10];

const metaExpected = {
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
    const s0 =
      "t0.`id` AS t0_id, t0.`issued` AS t0_issued, t0.`printed` AS t0_printed, t0.`score` AS t0_score, t0.`expires` AS t0_expires, t0.`log_date_added` AS t0_logDateAdded, t0.`test_user_id` AS t0_testUserId, t0.`reason` AS t0_reason, t0.`badge_status` AS t0_badgeStatus, t0.`is_log` AS t0_isLog, t0.`badge_id` AS t0_badgeId, t0.`log_comment` AS t0_logComment";
    // const s1 = "t1.`id` AS t1_id";
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

    const select = [s0, s2, s3, s4, s5, s6, s7, s8, s9, s10].join(", ");

    const s = [
      "SELECT " + select,
      "FROM user_certificate AS t0",
      //  "JOIN user_certificate_status AS t1 ON t1.id=t0.status_id",
      "LEFT JOIN user AS t2 ON t2.id=t0.log_user_id",
      "JOIN country AS t3 ON t3.id=t2.country_id",
      "LEFT JOIN company AS t4 ON t4.id=t2.company_id",
      "JOIN user AS t5 ON t5.id=t0.user_id",
      "JOIN country AS t6 ON t6.id=t2.country_id",
      "LEFT JOIN company AS t7 ON t7.id=t2.company_id",
      "JOIN cert AS t8 ON t8.id=t0.cert_id",
      "JOIN content_status AS t9 ON t9.id=t8.status_id",
      "LEFT JOIN user AS t10 ON t10.id=t8.log_user_id",
      "WHERE 1",
      "LIMIT 0, 3",
    ];

    const pSQL = S.toQuery(metaExpected);

    console.log(s.join("\n"));

    expect(pSQL).toEqual(s);
  });
});
