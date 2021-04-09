import Router from "koa-router";

import bodyParser from "koa-body";

import * as Middleware from "../middleware";
import * as DatabaseService from "../service/database";
import * as U from "../service/database/utils";

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

  const e = U.checkDatabase(body);

  if (e.length > 0) {
    ctx.status = 400;
    ctx.body = e;
    return;
  }

  ctx.body = await DatabaseService.set(ctx.state.jwtContent, body);
});

export default router.routes();
