import * as M from "./meta";
import * as TT from "./type";
import * as T from "../type";
import { RowDataPacket } from "mysql2";

import { get } from "../model";

const model = get["124_1"];

describe("to meta and to query", () => {
  const q: T.Query = {
    User: {
      projection: { firstName: true, status: { name: true } },
      filters: { status: { name: "ok" } },
    },
  };

  const meta: TT.MetaQueryUnit[] = [
    {
      alias: "t0",
      entity: "User",
      table: "user",
      fields: [
        { name: "uuid", column: "uuid" },
        { name: "firstName", column: "first_name" },
      ],
      filters: [],
    },
    {
      alias: "t1",
      entity: "UserStatus",
      table: "user_status",
      fields: [
        { name: "id", column: "id" },
        { name: "name", column: "col_name" },
      ],
      filters: [{ name: "name", column: "col_name", value: "ok" }],
      join: {
        entity: "User",
        field: {
          name: "status",
          column: "status_id",
          optional: false,
        },
      },
    },
  ];

  test("to meta", () => {
    expect(M.toMeta("User", q.User, model)).toEqual(meta);
  });

  test("to query", () => {
    expect(M.toQuery(meta)).toEqual([
      "SELECT t0.`uuid` AS t0_uuid, t0.`first_name` AS t0_firstName, t1.`id` AS t1_id, t1.`col_name` AS t1_name",
      "FROM user AS t0",
      "JOIN user_status AS t1 ON t1.id=t0.status_id",
      'WHERE 1 AND t1.`col_name`="ok"',
    ]);
  });
});

describe("to meta and to query 2", () => {
  const q: T.Query = {
    User: {
      projection: {
        uuid: true,
        firstName: true,
        status: { id: true, name: true },
      },
      filters: { uuid: "u3", status: { id: 7, name: "ok" } },
    },
  };

  const meta: TT.MetaQueryUnit[] = [
    {
      alias: "t0",
      entity: "User",
      table: "user",
      fields: [
        { name: "uuid", column: "uuid" },
        { name: "firstName", column: "first_name" },
      ],
      filters: [{ name: "uuid", column: "uuid", value: "u3" }],
    },
    {
      alias: "t1",
      entity: "UserStatus",
      table: "user_status",
      fields: [
        { name: "id", column: "id" },
        { name: "name", column: "col_name" },
      ],
      filters: [
        { name: "id", column: "id", value: 7 },
        { name: "name", column: "col_name", value: "ok" },
      ],
      join: {
        entity: "User",
        field: {
          name: "status",
          column: "status_id",
          optional: false,
        },
      },
    },
  ];

  test("to meta", () => {
    expect(M.toMeta("User", q.User, model)).toEqual(meta);
  });

  test("to query", () => {
    expect(M.toQuery(meta)).toEqual([
      "SELECT t0.`uuid` AS t0_uuid, t0.`first_name` AS t0_firstName, t1.`id` AS t1_id, t1.`col_name` AS t1_name",
      "FROM user AS t0",
      "JOIN user_status AS t1 ON t1.id=t0.status_id",
      'WHERE t0.`uuid`="u3" AND t1.`id`=7 AND t1.`col_name`="ok"',
    ]);
  });
});

test("simple select + parse", () => {
  const q: T.Query = { UserStatus: {} };
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE 1",
  ];
  const mq = M.toQuery(m);
  expect(mq).toEqual(s);
  const r = [
    {
      id: 1,
      name: "ok",
    },
    {
      id: 2,
      name: "pending",
    },
    {
      id: 3,
      name: "denied",
    },
  ];

  const y = [
    { t0_id: 1, t0_name: "ok" },
    { t0_id: 2, t0_name: "pending" },
    { t0_id: 3, t0_name: "denied" },
  ] as RowDataPacket[];

  expect(M.parse(y as any, m)).toEqual(r);
});

test("simple select to SQLs", () => {
  const q: T.Query = { UserStatus: {} };
  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE 1;",
  ].join("\n");
  const ss = M.createQuery(q, model).map((x) => x.sql);
  expect(ss).toEqual([s]);
});

test("simple select w projection", () => {
  const q: T.Query = { UserStatus: { projection: {} } };

  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE 1",
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = M.toQuery(m);
  expect(r).toEqual(s);
});

test("simple select w projection and filter", () => {
  const q: T.Query = {
    UserStatus: { projection: {}, filters: { id: 2, name: "ok" } },
  };
  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    'WHERE t0.`id`=2 AND t0.`col_name`="ok"',
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = M.toQuery(m);
  expect(r).toEqual(s);
});

test("select w json 2nd level", () => {
  const q: T.Query = {
    UserAuthentication: {
      projection: { value: true, user: { status: { name: true } } },
    },
  };
  const s = [
    "SELECT t0.`uuid` AS t0_uuid, t0.`value` AS t0_value, t1.`uuid` AS t1_uuid, t2.`id` AS t2_id, t2.`col_name` AS t2_name",
    "FROM user_authentication AS t0",
    "JOIN user AS t1 ON t1.id=t0.user_id",
    "JOIN user_status AS t2 ON t2.id=t1.status_id",
    "WHERE 1 AND 1 AND 1",
  ];

  const m = M.toMeta("UserAuthentication", q.UserAuthentication, model);
  const qs = M.toQuery(m);
  expect(qs).toEqual(s);

  const r = [
    {
      uuid: "73df6e2e-9334-11eb-af36-06a9a423ccf6",
      value: "myvalue",
      user: {
        uuid: "512a3fa3-9322-11eb-af36-06a9a423ccf6",
        status: { id: 1, name: "ok" },
      },
    },
  ];

  const y = [
    {
      t0_uuid: "73df6e2e-9334-11eb-af36-06a9a423ccf6",
      t0_value: "myvalue",
      t1_uuid: "512a3fa3-9322-11eb-af36-06a9a423ccf6",
      t2_id: 1,
      t2_name: "ok",
    },
  ] as RowDataPacket[];

  expect(M.parse(y as any, m)).toEqual(r);
});

test("implicitly nested query", () => {
  const entity = "UserAuthentication";
  const q: T.Query = {
    [entity]: {},
  };
  const m = [
    {
      entity: "UserAuthentication",
      table: "user_authentication",
      alias: "t0",
      fields: [
        { name: "uuid", column: "uuid" },
        { name: "value", column: "value" },
        { name: "isEnabled", column: "is_enabled" },
      ],
      filters: [],
    },
    {
      entity: "User",
      table: "user",
      alias: "t1",
      fields: [{ name: "uuid", column: "uuid" }],
      filters: [],
      join: {
        entity: "UserAuthentication",
        field: { name: "user", column: "user_id", optional: false },
      },
    },
  ];

  const em = M.toMeta(entity, q[entity], model);

  expect(m).toEqual(em);
});
