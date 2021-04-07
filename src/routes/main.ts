import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-body";

import * as Middleware from "../middleware";
import * as QueryService from "../service";
import * as ModelService from "../service/model";

const router: Router = new Router();

router.post(
  "/data",
  Middleware.isAuth,
  bodyParser(),
  async (ctx: Koa.Context) => {
    // get query
    const { body: query } = ctx.request;

    // get model
    try {
      const model = ModelService.getModel(ctx.state.jwtContent);

      try {
        ctx.body = await QueryService.run(query, model);
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
  }
);

router.post("/mutate", Middleware.isAuth, bodyParser(), async (ctx) => {
  // get query
  const { body: query } = ctx.request;

  // get model
  try {
    const model = ModelService.getModel(ctx.state.jwtContent);

    try {
      ctx.body = await QueryService.mutate(query, model);
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
