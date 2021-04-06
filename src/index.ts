import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-body";
import * as Middleware from "./middleware";

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

    ctx.body = { msg: "data" };
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
