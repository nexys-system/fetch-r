import { expect, test } from "bun:test";
import { Entity } from "../type.js";
import * as US from "./utils-string.js";
import * as U from "./utils.js";

const ddl: Entity[] = [
  {
    name: "MyEntity",
    uuid: true,
    fields: [{ name: "name", type: "String", optional: false }],
  },
];

test("getSchemaArrayFromDDL", () => {
  const s: string[] = [
    `type MyEntity {
  uuid: ID!
  name: String!
}`,
  ];
  expect(US.getSchemaArrayFromDDL(U.ddl(ddl))).toEqual(s);
});
