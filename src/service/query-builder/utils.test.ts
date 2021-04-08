import * as U from "./utils";

test("getAliasColumn", () => {
  expect(U.getAliasColumn("my_table", "my_field")).toEqual("my_table_my_field");
});

test("getLimitStatement", () => {
  expect(U.getLimitStatement({ take: 2 })).toEqual("LIMIT 0, 2");
  expect(U.getLimitStatement({ take: 2, skip: 4 })).toEqual("LIMIT 4, 2");
});

test("getOrderStatement", () => {
  expect(U.getOrderStatement({ by: "name" })).toEqual("ORDER BY t0_name ASC");
  expect(U.getOrderStatement({ by: "name", desc: true })).toEqual(
    "ORDER BY t0_name DESC"
  );
  expect(U.getOrderStatement({ by: "name", desc: false })).toEqual(
    "ORDER BY t0_name ASC"
  );
});

test("compare joins", () => {
  const j1 = { entity: "Entity", field: { name: "Field", optional: true } };
  expect(U.compareJoins(j1, { join: j1 }));
});
