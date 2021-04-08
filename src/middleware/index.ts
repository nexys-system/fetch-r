import Koa from "koa";
import JWT from "jsonwebtoken";

import * as C from "../config";

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

export const isAuth = async (ctx: Koa.Context, next: Koa.Next) => {
  const { headers } = ctx;

  try {
    isJson(headers);
    const jwtContent = extractAndVerify(headers);
    ctx.state.jwtContent = jwtContent;

    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: err.message };
  }
};
