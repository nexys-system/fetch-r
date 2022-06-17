import { Ddl } from "./type";
import * as US from "./utils-string";
import * as U from "./utils";
const ddl: Ddl[] = [
  { name: "MyEntity", uuid: true, fields: [{ name: "name", type: "String" }] },
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
