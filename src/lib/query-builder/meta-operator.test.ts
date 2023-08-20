import * as M from "./meta";
import * as S from "./sql";
import * as T from "../type";
import model from "./model-user";

test("simple select w projection and filter with operator", () => {
  const q: T.Query = {
    UserStatus: {
      projection: {},
      filters: {
        id: { $gt: 2, $lt: 10 },
        name: { $in: ["ok", "pending"] },
      },
    },
  };
  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE t0.`id`>2 AND t0.`id`<10 AND t0.`col_name` IN ('ok','pending')",
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = S.toQuery(m, "MySQL");
  expect(r).toEqual(s);
});

test("simple select w regex operator", () => {
  const q: T.Query = {
    UserStatus: {
      filters: {
        name: { $regex: "^aregexstring$" },
      },
    },
  };
  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE t0.`col_name` REGEXP '^aregexstring$'",
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = S.toQuery(m, "MySQL");
  expect(r).toEqual(s);
});

test("simple select w NOT IN operator", () => {
  const q: T.Query = {
    UserStatus: {
      filters: {
        name: { $ne: ["active", "inactive"] },
      },
    },
  };
  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE t0.`col_name` IS NOT IN ('active','inactive')",
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = S.toQuery(m, "MySQL");
  expect(r).toEqual(s);
});

test("simple select w NOT IN operator", () => {
  const q: T.Query = {
    UserStatus: {
      filters: {
        name: { $ne: undefined },
      },
    },
  };
  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE t0.`col_name` IS NOT NULL",
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = S.toQuery(m, "MySQL");
  expect(r).toEqual(s);
});

test("simple select w projection and filter by null", () => {
  const q: T.Query = {
    UserStatus: { projection: {}, filters: { name: null }, take: 4, skip: 8 },
  };

  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE t0.`col_name` IS NULL",
    "LIMIT 8, 4",
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = S.toQuery(m, "MySQL");
  expect(r).toEqual(s);
});
