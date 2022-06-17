import * as S from "./submodel";
import * as T from "./type";

const m1: T.Ddl[] = [
  {
    name: "Instance",
    uuid: true,
    fields: [{ name: "name", type: "String", optional: false }],
  },
  {
    name: "User",
    uuid: true,
    fields: [
      { name: "instance", type: "Instance", optional: false },
      { name: "name", type: "String", optional: false },
      { name: "firstName", type: "String", optional: false },
      { name: "school", type: "School", optional: false },
    ],
  },
  {
    name: "School",
    uuid: true,
    fields: [
      { name: "instance", type: "Instance", optional: false },
      { name: "name", type: "String", optional: false },
    ],
  },
];

test("generate submodel", () => {
  expect(S.createAppConstraint(m1)({ User: 1, Instance: "myid" })).toEqual({
    Instance: {
      filters: {
        uuid: "myid",
      },
      projection: {
        name: true,
      },
    },

    User: {
      filters: {
        instance: {
          uuid: "myid",
        },
        uuid: 1,
      },
      projection: {
        firstName: true,
        name: true,
        school: true,
      },
    },
    School: {
      filters: {
        instance: {
          uuid: "myid",
        },
      },
      projection: {
        name: true,
      },
    },
  });
});
