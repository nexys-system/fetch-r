import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-body";

import * as Middleware from "../middleware";
import * as QueryService from "../lib/exec";
import * as ModelService from "../service/model";
import * as DatabaseService from "../service/database";

const router: Router = new Router();

const query = async (ctx: Koa.Context) => {
  // get query
  const { body: query } = ctx.request;

  // get model
  try {
    const model = ModelService.getModel(ctx.state.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.state.jwtContent);

    const { sqlScript } = ctx.query;

    if (sqlScript) {
      ctx.body = { sql: QueryService.getSQL(query, model) };
      return;
    }

    try {
      ctx.body = await QueryService.exec(query, model, connectionPool);
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: err.message };
      return;
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "could not find model" };
    return;
  }
};

router.post(
  "/data",
  Middleware.isAuth,
  bodyParser(),
  async (ctx: Koa.Context) => query(ctx)
);

router.post(
  "/query",
  Middleware.isAuth,
  bodyParser(),
  async (ctx: Koa.Context) => query(ctx)
);

router.post("/mutate", Middleware.isAuth, bodyParser(), async (ctx) => {
  // get query
  const { body: query } = ctx.request;

  // get model
  try {
    const model = ModelService.getModel(ctx.state.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.state.jwtContent);

    try {
      ctx.body = await QueryService.mutate(query, model, connectionPool);
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: err.message };
      return;
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "could not find model" };
    return;
  }
});

router.all("/", async (ctx: Koa.Context) => {
  ctx.body = { msg: "fetch-r", version: process.env.GIT_SHA_ENV };
});

export default router.routes();
