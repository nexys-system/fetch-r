import JWT from "jsonwebtoken";
import * as C from "../config.js";

export const isJson = (headers: { "content-type"?: string }): void => {
  if (
    !headers["content-type"] ||
    headers["content-type"] !== "application/json"
  ) {
    throw Error("content type must be json");
  }

  return;
};

export const extractToken = ({
  authorization,
}: {
  authorization?: string;
}): string => {
  if (!authorization) {
    throw Error("no authorization header");
  }

  return authorization.slice(7); // "bearer ".length
};

export const verifyToken = (token: string): any =>
  JWT.verify(token, C.jwtSecret);

export const extractAndVerify = ({
  authorization,
}: {
  authorization?: string;
}) => {
  const token = extractToken({ authorization });
  return verifyToken(token);
};