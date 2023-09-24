import { QueryParams, Entity } from "../../../type";

import * as T from "../type";
import * as Q from "./data";

const model: Entity[] = [
  {
    name: "User",
    uuid: false,
    fields: [
      { name: "email", type: "String", optional: false },
      { name: "logUser", type: "User", optional: false },
      { name: "house", type: "House", optional: false },
    ],
  },
  {
    name: "House",
    uuid: true,
    fields: [
      { name: "name", type: "String", optional: false },
      { name: "street", type: "String", optional: false },
    ],
  },
];

describe("constructParamsPermission", () => {
  const constraint: T.ProjectionConstraint = {
    attribute: "logUser",
  };

  const qOut: QueryParams = {
    filters: { id: 3 },
    projection: { id: true, logUser: { id: true } },
  };

  test("simple", () => {
    const constraintsMap: Map<string, T.ProjectionConstraint[]> = new Map([
      ["User", [constraint]],
    ]);

    const postQ: QueryParams = Q.constructParamsPermission(
      "User",
      {
        filters: { id: 3 },
        projection: { logUser: true },
      },
      new Map([]),
      constraintsMap,
      model
    );

    expect(postQ).toEqual({
      filters: { id: 3 },
      projection: { id: true, logUser: { id: true } },
    });
  });

  test("implicit fk", () => {
    const constraintsMap: Map<string, T.ProjectionConstraint[]> = new Map([
      ["User", [{ attribute: "house" }, { attribute: "email" }]],
    ]);

    const postQ: QueryParams = Q.constructParamsPermission(
      "User",
      {
        filters: { id: 3 },
        projection: { house: {} },
      },
      new Map([]),
      constraintsMap,
      model
    );

    expect(postQ).toEqual({
      filters: { id: 3 },
      projection: { id: true, house: { uuid: true }, email: true },
    });
  });

  test("nested", () => {
    const constraintsMap: Map<string, T.ProjectionConstraint[]> = new Map([
      ["User", [constraint, { attribute: "house" }]],
    ]);

    const postQ: QueryParams = Q.constructParamsPermission(
      "User",
      {
        filters: { id: 3 },
        projection: { logUser: true, house: {} },
      },
      new Map([]),
      constraintsMap,
      model
    );

    expect(postQ).toEqual({
      filters: { id: 3 },
      projection: { id: true, logUser: { id: true }, house: { uuid: true } },
    });
  });

  test("nested with params", () => {
    const constraintsMap: Map<string, T.ProjectionConstraint[]> = new Map([
      ["User", [constraint, { attribute: "house" }]],
      ["House", [constraint, { attribute: "name" }]],
    ]);
    const postQ: QueryParams = Q.constructParamsPermission(
      "User",
      {
        filters: { id: 3 },
        projection: { logUser: true, house: { name: true } },
      },
      new Map([]),
      constraintsMap,
      model
    );

    expect(postQ).toEqual({
      filters: { id: 3 },
      projection: {
        id: true,
        logUser: { id: true },
        house: { uuid: true, name: true },
      },
    });
  });

  test("remove loguser", () => {
    const q: QueryParams = {
      filters: { id: 3 },
      projection: { logUser: { id: true } },
    };

    const constraintsMap: Map<string, T.ProjectionConstraint[]> = new Map([
      ["User", [constraint]],
    ]);

    const postQ: QueryParams = Q.constructParamsPermission(
      "User",
      q,
      new Map(),
      constraintsMap,
      model
    );

    expect(postQ).toEqual(qOut);
  });

  test("add filter", () => {
    const q: QueryParams = {
      filters: { id: 3 },
      projection: { logUser: true },
    };

    const constraintFilter: T.FilterConstraint = {
      attribute: "user",
      filterAttribute: { id: 8 } as any, // todo fix,
    };

    const postQ: QueryParams = Q.constructParamsPermission(
      "User",
      { ...q },
      new Map([["User", [constraintFilter]]]),
      new Map([["User", [constraint]]]),
      model
    );

    expect(postQ.filters).toEqual({ id: 3, user: { id: 8 } });
  });

  test("filter override", () => {
    const q: QueryParams = {
      filters: { id: 3 },
      projection: { logUser: true },
    };

    const constraintFilter: T.FilterConstraint = {
      attribute: "id",
      filterAttribute: 9,
    };

    const postQ = Q.constructFilterPermission(
      "User",
      new Map(),
      new Map([["User", [constraintFilter]]]),
      q.filters,
      model
    );

    expect(postQ).toEqual({ id: 9 });
  });

  test("filter nested", () => {
    const q: QueryParams = {
      filters: {
        id: 3,
        email: "john@doe.com",
        house: { street: "route", name: "bla" },
      }, // note that email will be ignored since it is not in projection constraints
      projection: { logUser: true },
    };

    const constraintFilter: T.FilterConstraint = {
      attribute: "id",
      filterAttribute: 9,
    };

    const postQ = Q.constructFilterPermission(
      "User",
      new Map([
        ["User", [{ attribute: "house" }]],
        ["House", [{ attribute: "street" }]],
      ]),
      new Map([
        ["User", [constraintFilter]],
        ["House", [{ attribute: "name", filterAttribute: "myhouse" }]],
      ]),
      q.filters,
      model
    );

    expect(postQ).toEqual({
      id: 9,
      house: { name: "myhouse", street: "route" },
    });
  });
});
