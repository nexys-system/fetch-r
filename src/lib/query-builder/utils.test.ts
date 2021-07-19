import * as U from "./utils";

test("getAliasColumn", () => {
  expect(U.getAliasColumn("my_table", "my_field")).toEqual("my_table_my_field");
});

test("getLimitStatement", () => {
  expect(U.getLimitStatement({ take: 2 })).toEqual("LIMIT 0, 2");
  expect(U.getLimitStatement({ take: 2, skip: 4 })).toEqual("LIMIT 4, 2");
});

test("getOrderStatement", () => {
  expect(U.getOrderStatement("name")).toEqual("ORDER BY t0_name ASC");
  expect(U.getOrderStatement("name", true)).toEqual("ORDER BY t0_name DESC");
  expect(U.getOrderStatement("name", false)).toEqual("ORDER BY t0_name ASC");
});

test("compare joins", () => {
  const j1 = { entity: "Entity", field: { name: "Field", optional: true } };
  expect(U.compareJoins(j1, { join: j1 }));
});

describe("getValueAndOperator", () => {
  test("in", () => {
    expect(U.getValueAndOperator({ $in: [1, 2, 3] })).toEqual([
      {
        operator: "in",
        value: [1, 2, 3],
      },
    ]);
  });

  test("lt", () => {
    expect(U.getValueAndOperator({ $lt: 23 })).toEqual([
      {
        operator: "lt",
        value: 23,
      },
    ]);
  });

  test("lt and gt", () => {
    expect(U.getValueAndOperator({ $lt: 23, $gt: 4 })).toEqual([
      {
        operator: "lt",
        value: 23,
      },
      {
        operator: "gt",
        value: 4,
      },
    ]);
  });
});

test("to operator", () => {
  expect(U.toOperator("$ne")).toEqual("neq");
});

test("to sql operator", () => {
  expect(U.toSQLOperator("in")).toEqual(" IN ");
});

describe("format date sql", () => {
  test("simple", () => {
    expect(U.formatDateSQL("2021-06-26T15:46:50")).toEqual(
      "'2021-06-26T15:46:50.000'"
    );
  });
});

describe("is null", () => {
  test("optional", () => {
    expect(U.isNull(true)).toEqual(true);
  });

  test("non optional - 0", () => {
    expect(U.isNull(false, 0)).toEqual(false);
  });

  test("non optional - false", () => {
    expect(U.isNull(false, false)).toEqual(false);
  });
});

test("remove id", () => {
  const a = {
    User: [
      {
        id: 1,
        uuid: "u1",
        name: "pablo",
        ob: { id: 3, uuid: "u3", occupation: "Dealer" },
        myArray: [
          { id: 4, uuid: "u4", i: 1 },
          { id: 5, uuid: "u5", i: 2 },
        ],
      },
    ],
  };

  const b = {
    User: [
      {
        uuid: "u1",
        name: "pablo",
        ob: { uuid: "u3", occupation: "Dealer" },
        myArray: [
          { uuid: "u4", i: 1 },
          { uuid: "u5", i: 2 },
        ],
      },
    ],
  };

  U.removeId(a);

  expect(a).toEqual(b);
});
