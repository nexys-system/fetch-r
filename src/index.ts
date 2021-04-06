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

const getModel = (j: JwtStructure) => {
  const model = models[j.product + "_" + j.env];

  if (!model) {
    throw Error("could not find model");
  }
  return model;
};

router.all(
  "/data",
  Middleware.isAuth,
  bodyParser(),
  async (ctx: Koa.Context) => {
    // get query
    const { body: query } = ctx.request;

    // get model
    try {
      const model = getModel(ctx.state.jwtContent);

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

router.post("/mutate", async (ctx) => {
  ctx.body = { msg: "mutate" };
});

app.use(router.routes());

const port = 9000 || process.env.PORT;
app.listen(port, () => {
  console.log("fetch-r started on port " + port);
});
