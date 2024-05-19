import * as L from "./legacy.js";
import Model from "./model-academy.js";

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

test("augment - do not discard child entity projections", () => {
  const entity = "UserCertificate";
  const projection = { logUser: { id: true, firstName: true } };

  L.augment(entity, projection, Model);

  expect(projection).toEqual({
    badgeId: true,
    badgeStatus: true,
    cert: true,
    expires: true,
    isLog: true,
    issued: true,
    logComment: true,
    logDateAdded: true,
    logUser: {
      id: true,
      firstName: true,
    },
    printed: true,
    reason: true,
    score: true,
    status: true,
    testUserId: true,
    user: true,
  });
});
