import Router from "koa-router";

import bodyParser from "koa-body";

import * as Middleware from "../middleware";
import * as DatabaseService from "../service/database";
import * as V from "@nexys/validation";

const router: Router = new Router();

router.all("/get", Middleware.isAuth, async (ctx) => {
  ctx.body = DatabaseService.get(ctx.state.jwtContent);
});
router.all(
  "/set",
  Middleware.isAuth,
  bodyParser(),
  V.Main.isShapeMiddleware({
    database: {},
    username: {},
    password: {},
    host: {},
    port: { type: "number", optional: true },
  }),
  async (ctx) => {
    const { body } = ctx.request;

    ctx.body = await DatabaseService.set(ctx.state.jwtContent, body);
  }
);

export default router.routes();
