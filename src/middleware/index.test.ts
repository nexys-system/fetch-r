import * as M from "./index";
import JWT from "jsonwebtoken";
import * as C from "../config";

test("extractToken", () => {
  expect(M.extractToken({ authorization: "Bearer mytoken" })).toEqual(
    "mytoken"
  );
});

test("verify", () => {
  const payload = { a: "random", json: "token" };
  const jwt = JWT.sign(payload, C.jwtSecret);
  const { iat, ...ejwt } = M.verifyToken(jwt);
  expect(ejwt).toEqual(payload);
});
