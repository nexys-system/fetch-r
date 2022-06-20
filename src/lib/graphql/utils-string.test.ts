import * as US from "./utils-string";
import * as U from "./utils";
import { Entity } from "../type";

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
