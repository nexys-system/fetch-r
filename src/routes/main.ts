import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-body";

import { version, sha } from "../config.js";

import * as Middleware from "../middleware/index.js";
import * as QueryService from "../lib/exec.js";
import * as ModelService from "../service/model/index.js";
import * as DatabaseService from "../service/database/index.js";
import * as AggregateService from "../lib/query-builder/aggregate/index.js";

const router: Router = new Router();

const aggregate = async (ctx: Koa.Context) => {
  const { body: query } = ctx.request;
  // get model
  try {
    const model = ModelService.getModel(ctx.state.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.state.jwtContent);

    try {
      ctx.body = await AggregateService.exec(query, model, connectionPool);
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: (err as any).message };
      return;
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "could not find model" };
    return;
  }
};

const databaseType = "MySQL";

const query = async (ctx: Koa.Context) => {
  // get query
  const { body: query } = ctx.request;
  const { sqlScript } = ctx.query;

  // get model
  try {
    const model = ModelService.getModel(ctx.state.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.state.jwtContent);

    if (sqlScript) {
      const sql = QueryService.getSQL(query, model, databaseType);

      ctx.body = { sql };
      return;
    }

    try {
      ctx.body = await QueryService.exec(
        query,
        model,
        connectionPool,
        databaseType
      );
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: (err as any).message };
      return;
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "could not find model" };
    return;
  }
};

router.post(
  "/aggregate",
  Middleware.isAuth,
  bodyParser(),
  async (ctx: Koa.Context) => aggregate(ctx)
);

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

    const { sqlScript } = ctx.query;

    try {
      if (sqlScript) {
        ctx.body = {
          sql: QueryService.getSQLMutate(query, model, databaseType),
        };
        return;
      }

      ctx.body = await QueryService.mutate(
        query,
        model,
        connectionPool,
        databaseType
      );
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: (err as any).message };
      return;
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "could not find model" };
    return;
  }
});

router.all("/", async (ctx: Koa.Context) => {
  ctx.body = {
    msg: "fetch-r",
    sha,
    version,
  };
});

export default router.routes();
