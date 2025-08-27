import { describe, expect, test } from "bun:test";
import { RowDataPacket } from "../database/type.js";
import * as T from "../type.js";
import * as M from "./meta.js";
import model from "./model-user.js";
import * as P from "./parse.js";
import * as S from "./sql.js";
import * as TT from "./type.js";

describe("to meta and to query", () => {
  const q: T.Query = {
    User: {
      projection: { firstName: true, status: { name: true } },
      filters: { status: { name: "ok" } },
    },
  };

  const units: TT.MetaQueryUnit[] = [
    {
      alias: "t0",
      idx: [0, 0],

      entity: "User",
      table: "user",
      fields: [
        { name: "id", column: "id" },
        { name: "uuid", column: "uuid" },
        { name: "firstName", column: "first_name" },
      ],
      filters: [],
    },
    {
      alias: "t1",
      idx: [0, 1],
      entity: "UserStatus",
      table: "user_status",
      fields: [
        { name: "id", column: "id" },
        { name: "name", column: "col_name" },
      ],
      filters: [
        { name: "name", column: "col_name", value: "ok", operator: "=" },
      ],
      join: {
        entity: "User",
        entityRef: [0, 0],
        field: {
          name: "status",
          column: "status_id",
          optional: false,
        },
      },
    },
  ];

  const meta: TT.MetaQuery = { units };

  test("to meta", () => {
    expect(M.toMeta("User", q.User, model)).toEqual(meta);
  });

  test("to query", () => {
    expect(S.toQuery(meta, "MySQL")).toEqual([
      "SELECT t0.`id` AS t0_id, t0.`uuid` AS t0_uuid, t0.`first_name` AS t0_firstName, t1.`id` AS t1_id, t1.`col_name` AS t1_name",
      "FROM user AS t0",
      "JOIN user_status AS t1 ON t1.id=t0.status_id",
      "WHERE t1.`col_name`='ok'",
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

  const units: TT.MetaQueryUnit[] = [
    {
      alias: "t0",
      idx: [0, 0],
      entity: "User",
      table: "user",
      fields: [
        { name: "id", column: "id" },
        { name: "uuid", column: "uuid" },
        { name: "firstName", column: "first_name" },
      ],
      filters: [{ name: "uuid", column: "uuid", value: "u3", operator: "=" }],
    },
    {
      alias: "t1",
      idx: [0, 1],
      entity: "UserStatus",
      table: "user_status",
      fields: [
        { name: "id", column: "id" },
        { name: "name", column: "col_name" },
      ],
      filters: [
        { name: "id", column: "id", value: 7, operator: "=" },
        { name: "name", column: "col_name", value: "ok", operator: "=" },
      ],
      join: {
        entity: "User",
        entityRef: [0, 0],
        field: {
          name: "status",
          column: "status_id",
          optional: false,
        },
      },
    },
  ];

  test("to meta", () => {
    expect(M.toMeta("User", q.User, model).units).toEqual(units);
  });

  test("to query", () => {
    expect(S.toQuery({ units }, "MySQL")).toEqual([
      "SELECT t0.`id` AS t0_id, t0.`uuid` AS t0_uuid, t0.`first_name` AS t0_firstName, t1.`id` AS t1_id, t1.`col_name` AS t1_name",
      "FROM user AS t0",
      "JOIN user_status AS t1 ON t1.id=t0.status_id",
      "WHERE t0.`uuid`='u3' AND t1.`id`=7 AND t1.`col_name`='ok'",
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
  const mq = S.toQuery({ units: m.units }, "MySQL");
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

  expect(P.parse(y as any, m, "MySQL")).toEqual(r);
});

test("simple select to SQLs", () => {
  const q: T.Query = {
    UserStatus: { take: 2, order: { by: "name", desc: true } },
  };
  const s =
    [
      "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
      "FROM user_status AS t0",
      "WHERE 1",
      "ORDER BY t0_name DESC",
      "LIMIT 0, 2",
    ].join("\n") + ";";

  const ss = M.createQuery(q, model, "MySQL").map((x) => x.sql);
  expect(ss).toEqual([s]);
});

test("simple select w projection", () => {
  const q: T.Query = { UserStatus: { projection: {}, take: 4, skip: 8 } };

  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE 1",
    "LIMIT 8, 4",
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = S.toQuery(m, "MySQL");
  expect(r).toEqual(s);
});

test("simple select w projection and filter", () => {
  const q: T.Query = {
    UserStatus: {
      projection: {},
      filters: {
        id: 2,
        name: "ok",
      },
    },
  };
  const s = [
    "SELECT t0.`id` AS t0_id, t0.`col_name` AS t0_name",
    "FROM user_status AS t0",
    "WHERE t0.`id`=2 AND t0.`col_name`='ok'",
  ];
  const m = M.toMeta("UserStatus", q.UserStatus, model);
  const r = S.toQuery(m, "MySQL");
  expect(r).toEqual(s);
});

test("select w json 2nd level", () => {
  const q: T.Query = {
    UserAuthentication: {
      projection: { value: true, user: { status: { name: true } } },
    },
  };

  const s = [
    "SELECT t0.`id` AS t0_id, t0.`uuid` AS t0_uuid, t0.`value` AS t0_value, t1.`id` AS t1_id, t1.`uuid` AS t1_uuid, t2.`id` AS t2_id, t2.`col_name` AS t2_name",
    "FROM user_authentication AS t0",
    "JOIN user AS t1 ON t1.id=t0.user_id",
    "JOIN user_status AS t2 ON t2.id=t1.status_id",
    "WHERE 1",
  ];

  const m = M.toMeta("UserAuthentication", q.UserAuthentication, model);
  const qs = S.toQuery(m, "MySQL");
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

  expect(P.parse(y as any, m, "MySQL")).toEqual(r);
});

test("implicitly nested query", () => {
  const entity = "UserAuthentication";
  const q: T.Query = {
    [entity]: {},
  };
  const m: TT.MetaQueryUnit[] = [
    {
      entity: "UserAuthentication",
      table: "user_authentication",
      alias: "t0",
      idx: [0, 0],
      fields: [
        { name: "id", column: "id" },
        { name: "uuid", column: "uuid" },
        { name: "value", column: "value" },
        { name: "isEnabled", column: "is_enabled", type: "Boolean" },
      ],
      filters: [],
    },

    {
      alias: "t1",
      idx: [0, 1],
      entity: "UserAuthenticationType",
      fields: [
        {
          column: "id",
          name: "id",
        },
      ],
      filters: [],
      join: {
        entity: "UserAuthentication",
        entityRef: [0, 0],
        field: {
          column: "type_id",
          name: "type",
          optional: false,
        },
      },
      table: "user_authentication_type",
    },
    {
      entity: "User",
      table: "user",
      alias: "t2",
      idx: [1, 1],
      fields: [
        { name: "id", column: "id" },
        { name: "uuid", column: "uuid" },
      ],
      filters: [],
      join: {
        entity: "UserAuthentication",
        entityRef: [0, 0],
        field: { name: "user", column: "user_id", optional: false },
      },
    },
  ];

  const em = M.toMeta(entity, q[entity], model);

  expect(m).toEqual(em.units);
});

//

test("select and simple filter fk", () => {
  const q: T.Query = {
    Instance: {
      projection: { product: undefined },
      filters: { product: { id: 3 } },
    },
  };

  const s = [
    "SELECT t0.`id` AS t0_id, t0.`uuid` AS t0_uuid, t1.`id` AS t1_id",
    "FROM instance AS t0",
    "LEFT JOIN product AS t1 ON t1.id=t0.undefined",
    "WHERE t1.`id`=3",
  ];

  const m = M.toMeta("Instance", q.Instance, model);
  const qs = S.toQuery(m, "MySQL");
  expect(qs).toEqual(s);
});

test("select and filter undefined", () => {
  const q: T.Query = {
    Instance: {
      projection: {},
      filters: { product: undefined },
    },
  };

  const s = [
    "SELECT t0.`id` AS t0_id, t0.`uuid` AS t0_uuid, t0.`name` AS t0_name, t0.`date_added` AS t0_dateAdded, t1.`id` AS t1_id",
    "FROM instance AS t0",
    "LEFT JOIN product AS t1 ON t1.id=t0.undefined",
    "WHERE 1",
  ];

  const m = M.toMeta("Instance", q.Instance, model);
  const qs = S.toQuery(m, "MySQL");
  expect(qs).toEqual(s);
});
