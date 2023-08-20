import Router from "koa-router";
import bodyParser from "koa-body";
import { graphql, printSchema } from "graphql";

import Schema from "../lib/graphql/schema";
import { Submodel } from "../lib/graphql/type";
import * as Middleware from "../middleware";

import * as ModelService from "../service/model";
import * as DatabaseService from "../service/database";

const router = new Router();

type Permission = {};
// empty submodels
const submodels: Submodel<Permission>[] = [];

router.all("/", async (ctx) => {
  ctx.body = {
    message:
      "available endpoints are `/schema` for the schema and `/query` for queying the schema",
  };
});

// this is the default schema, superadmin
router.all("/schema", bodyParser(), Middleware.isAuth, async (ctx) => {
  try {
    const model = ModelService.getModel(ctx.state.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.state.jwtContent);

    const databaseType = "MySQL";

    const schemas = new Schema<Permission>(
      model,
      connectionPool,
      databaseType,
      submodels
    );
    ctx.body = printSchema(schemas.gQLSchema);
  } catch (e) {
    ctx.status = 400;
    console.log(e);
    ctx.body = { error: (e as Error).message };
  }
});

router.post("/query", bodyParser(), Middleware.isAuth, async (ctx) => {
  const {
    body: { query },
  } = ctx.request;
  try {
    const model = ModelService.getModel(ctx.state.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.state.jwtContent);
    const databaseType = "MySQL";

    const schemas = new Schema<Permission>(
      model,
      connectionPool,
      databaseType,
      submodels
    );
    ctx.body = await graphql({ schema: schemas.gQLSchema, source: query });
  } catch (e) {
    ctx.status = 400;
    ctx.body = { error: (e as Error).message };
  }
});

export default router.routes();
