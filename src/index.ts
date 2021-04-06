import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-body";
import * as Middleware from "./middleware";
import * as QueryService from "./service";
import * as ModelService from "./service/model";

interface JwtStructure {
  instance: string;
  product: number;
  env: 1 | 2 | 3;
}

const app = new Koa();
const router: Router = new Router();

// get models
// todo : multiple
const models = ModelService.get;

router.all("/", async (ctx: Koa.Context) => {
  ctx.body = { msg: "hello" };
});

router.all(
  "/data",
  Middleware.isAuth,
  bodyParser(),
  async (ctx: Koa.Context) => {
    // get model
    const jwtContent: JwtStructure = ctx.state.jwtContent;

    // get query
    const { body: query } = ctx.request;

    const model = models[jwtContent.product + "_" + jwtContent.env];

    try {
      const r = await QueryService.run(query, model);

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
