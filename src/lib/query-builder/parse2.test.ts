import * as P from "./parse";
import { RowDataPacket } from "mysql2";
import { MetaQuery } from "./type";

describe("get parsed value", () => {
  test("string", () => {
    const e = P.getParsedValue({ name: "myname" } as RowDataPacket, "name");

    expect(e).toEqual("myname");
  });

  test("boolean", () => {
    const e = P.getParsedValue(
      { isAdded: true } as RowDataPacket,
      "isAdded",
      "Boolean"
    );

    expect(e).toEqual(true);

    const e2 = P.getParsedValue(
      { isAdded: false } as RowDataPacket,
      "isAdded",
      "Boolean"
    );

    expect(e2).toEqual(false);

    const e3 = P.getParsedValue(
      { isAdded: undefined } as RowDataPacket,
      "isAdded",
      "Boolean"
    );

    expect(e3).toEqual(undefined);
  });
});

const response: RowDataPacket = [
  { t0_id: 11, t1_id: 138, t2_id: 1681, t0_isEnabled: true },
  { t0_id: 12, t1_id: 2, t2_id: 1683, t0_isEnabled: false },
] as RowDataPacket;
const meta: MetaQuery = {
  units: [
    {
      entity: "User",
      table: "user",
      filters: [],
      fields: [
        { name: "id", column: "id" },
        { name: "isEnabled", column: "is_enabled", type: "Boolean" },
      ],
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

test("parse - idx=0", () => {
  const row = response[0];
  expect(P.parseUnit(row, meta.units, "MySQL")).toEqual({
    id: 11,
    isEnabled: true,
    company: { id: 138, logUser: { id: 1681 } },
  });
});

test("parse - idx=1", () => {
  const row = response[1];
  expect(P.parseUnit(row, meta.units, "MySQL")).toEqual({
    id: 12,
    isEnabled: false,
    company: { id: 2, logUser: { id: 1683 } },
  });
});
