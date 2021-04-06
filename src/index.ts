import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-body";
import * as Middleware from "./middleware";
import * as QueryService from "./service";

const app = new Koa();
const router: Router = new Router();

router.all("/", async (ctx: Koa.Context) => {
  ctx.body = { msg: "hello" };
});

router.all(
  "/data",
  Middleware.isAuth,
  bodyParser(),
  async (ctx: Koa.Context) => {
    // get model

    // get query
    const { body: query } = ctx.request;

    try {
      const r = await QueryService.run(query);

      ctx.body = r;
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: err.message };
    }
  }
);

router.post("/mutate", async (ctx) => {
  ctx.body = { msg: "mutate" };
});

app.use(router.routes());

const port = 9000 || process.env.PORT;
app.listen(port, () => {
  console.log("fetch-r started on port " + port);
});
