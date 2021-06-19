import * as L from "./legacy";
import Model from "./model-academy";

test("augment", () => {
  const projection = {};
  L.augment("User", projection, Model);
  expect(projection).toEqual({
    company: true,
    country: true,
    email: true,
    firstName: true,
    isAdmin: true,
    kyiId: true,
    language: true,
    lastName: true,
    logDateAdded: true,
    logIp: true,
    password: true,
    secretKey: true,
    simulcationUser: true,
    status: true,
  });
});
