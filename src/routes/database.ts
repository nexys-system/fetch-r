import Router from "koa-router";

import bodyParser from "koa-body";

import * as Middleware from "../middleware";
import * as DatabaseService from "../service/database";

const router: Router = new Router();

router.all("/get", Middleware.isAuth, async (ctx) => {
  ctx.body = DatabaseService.get(ctx.state.jwtContent);
});
router.all("/set", Middleware.isAuth, bodyParser(), async (ctx) => {
  const { body } = ctx.request;

  if (!body) {
    ctx.status = 400;
    ctx.body = { error: "payload expected" };
  }

  ctx.body = await DatabaseService.set(ctx.state.jwtContent, body);
});

export default router.routes();
