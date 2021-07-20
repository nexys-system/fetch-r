import * as P from "./parse";
import { RowDataPacket } from "mysql2";
import { MetaQuery } from "./type";

const response: RowDataPacket = [
  { t0_id: 11, t1_id: 138, t2_id: 1681 },
  { t0_id: 12, t1_id: 2, t2_id: 1681 },
] as RowDataPacket;
const meta: MetaQuery = {
  units: [
    {
      entity: "User",
      table: "user",
      filters: [],
      fields: [{ name: "id", column: "id" }],
      alias: "t0",
      idx: [0, 0],
    },
    {
      entity: "Company",
      table: "company",
      filters: [],
      fields: [{ name: "id", column: "id" }],
      join: {
        entity: "User",
        entityRef: [0, 0],
        field: { name: "company", column: "company_id", optional: true },
      },
      alias: "t1",
      idx: [0, 1],
    },
    {
      entity: "User",
      table: "user",
      filters: [],
      fields: [{ name: "id", column: "id" }],
      join: {
        entity: "Company",
        entityRef: [0, 1],
        field: { name: "logUser", column: "log_user_id", optional: true },
      },
      alias: "t2",
      idx: [0, 2],
    },
  ],
  take: 2,
};

test("parse", () => {
  expect(P.parseUnit(response[0], meta.units)).toEqual({
    id: 11,
    company: { id: 138, logUser: { id: 1681 } },
  });
});
