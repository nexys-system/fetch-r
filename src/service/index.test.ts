import * as T from "./type";

const mq: T.Query = {
  Instance: {
    projection: { dateAdded: true },
    filters: { name: "nexys" },
  },
  UserStatus: { filters: { id: 2 } },
  User: {
    projection: {
      firstName: true,
      lastName: true,
      status: { name: true },
      instance: { name: true },
    },
  },
  UserAuthentication: {
    projection: {
      value: true,
      user: {
        firstName: true,
        lastName: true,
        instance: { name: true },
        status: {},
      },
    },
  },
};

const mq2 = { UserAuthentication: {} };

const iq = {
  UserStatus: { insert: { data: { name: "m1!" } } },
};

test("dummy", () => {
  expect(true).toEqual(true);
});
