import * as M from "./meta";
import { entities as model } from "../model";
import * as T from "../type";

const meta: M.MetaQueryUnit[] = [
  {
    entity: "User",
    table: "user",
    alias: "t0",
    fields: [{ name: "firstName", column: "first_name" }],
    filters: [],
  },
  {
    entity: "UserStatus",
    table: "user_status",
    alias: "t1",
    join: { entity: "User", field: "name", optional: false },
    fields: [{ name: "name", column: "col_name" }],
    filters: [{ name: "id", column: "id", value: 7 }],
  },
];

test("to query", () => {
  expect(M.toQuery(meta)).toEqual([
    "SELECT t0.first_name, t1.col_name",
    "FROM user",
    "JOIN user_status as t0 ON t0.id=0=name",
    "WHERE 1 AND t1.id=7",
  ]);
});

const q: T.Query = {
  User: {
    projection: { firstName: true, status: { name: true } },
    filters: { status: { name: 7 } },
  },
};

test("to meta", () => {
  // todo filters
  expect(M.toMeta("User", q.User, model)).toEqual([
    {
      entity: "User",
      table: "user",
      alias: "t0",
      fields: [{ column: "first_name", name: "firstName" }],
      filters: [],
      join: undefined,
    },
    {
      alias: "t1",
      entity: "UserStatus",
      fields: [{ column: "name", name: "name" }],
      filters: [],
      join: { entity: "User", field: "status", optional: false },
      table: "user_status",
    },
  ]);
});
