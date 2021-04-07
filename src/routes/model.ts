import Router from "koa-router";

import bodyParser from "koa-body";

import * as Middleware from "../middleware";
import * as ModelService from "../service/model";

const router: Router = new Router();

router.all("/get", Middleware.isAuth, async (ctx) => {
  ctx.body = ModelService.getModel(ctx.state.jwtContent);
});
router.all("/set", Middleware.isAuth, bodyParser(), async (ctx) => {
  const { body } = ctx.request;

  if (!body) {
    ctx.status = 400;
    ctx.body = { error: "payload expected" };
  }

  if (!Array.isArray(body)) {
    ctx.status = 400;
    ctx.body = { error: "expected input must be an array" };
  }

  ctx.body = await ModelService.set(ctx.state.jwtContent, body);
});

export default router.routes();
