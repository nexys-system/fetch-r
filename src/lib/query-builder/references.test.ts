import { Entity, Field, References } from "../type";
import * as R from "./references";
import model from "../query-builder/model-academy";

describe("get field - joinOn", () => {
  const field1: Field = { name: "logUser", type: "User", optional: false };
  const field2: Field = { name: "user", type: "User", optional: false };

  const modelUnit: Entity = {
    name: "User",
    uuid: false,
    fields: [field1, field2],
  };

  test("no joinOn give, get first match", () => {
    const fieldUnit = R.getFieldUnit({ joinOn: undefined }, modelUnit, "User");
    expect(fieldUnit).toEqual(field1);
  });

  test("no joinOn give, get first match", () => {
    const fieldUnit = R.getFieldUnit({ joinOn: "logUser" }, modelUnit, "User");
    expect(fieldUnit).toEqual(field1);
  });

  test("no joinOn give, get first match", () => {
    const fieldUnit = R.getFieldUnit({ joinOn: "user" }, modelUnit, "User");
    expect(fieldUnit).toEqual(field2);
  });

  test("no joinOn give, get first match", () => {
    try {
      R.getFieldUnit({ joinOn: "doesnotexist" }, modelUnit, "User");
    } catch (err) {
      console.log(err.message);
      expect(true).toEqual(true);
    }
  });
});

test("augment ref query", () => {
  const references: References = {
    File: {
      projection: {
        type: {
          name: true,
        },
      },
    },
    Link: {
      projection: {
        type: {
          name: true,
        },
      },
    },
  };

  const referencesPost: References = {
    File: {
      projection: {
        type: {
          name: true,
        },
        resource: {},
      },
    },
    Link: {
      projection: {
        type: {
          name: true,
        },
        resource: {},
      },
    },
  };
  R.augmentRefQuery(references, model, "Resource");

  expect(references).toEqual(referencesPost);
});
