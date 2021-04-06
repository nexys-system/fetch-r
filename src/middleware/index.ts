import Koa from "koa";
import JWT from "jsonwebtoken";

import * as C from "../config";

export const extractToken = ({
  authorization,
}: {
  authorization?: string;
}): string => {
  if (!authorization) {
    throw Error("no authorization header");
  }

  return authorization.slice("bearer ".length);
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
    const jwtContent = extractAndVerify(headers);
    ctx.state.jwtContent = jwtContent;

    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: err.message };
  }
};
