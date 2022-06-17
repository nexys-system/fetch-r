import Router from "koa-router";
import bodyParser from "koa-body";
import { graphql, printSchema } from "graphql";

import Schema from "../schema";

import * as ErrorHandler from "./error-handler";

const getRouter = <Permission>(
  schemas: Schema<Permission>,
  roleMap: Map<string, Permission>
) => {
  const router = new Router();

  // access for app (using app token)

  // this is the default schema, superadmin
  router.all("/schema", bodyParser(), async (ctx) => {
    ctx.body = printSchema(schemas.gQLSchema);
  });

  router.post("/query", bodyParser(), async (ctx) => {
    const {
      body: { query },
    } = ctx.request;

    ctx.body = await graphql({ schema: schemas.gQLSchema, source: query });
  });

  // end default

  // end: access for app (using app token)

  // access for client with specific role
  router.all("/:role/schema", bodyParser(), async (ctx) => {
    try {
      const schema = schemas.getSchemaFromCtx(ctx, roleMap);
      ctx.body = printSchema(schema);
    } catch (err) {
      ErrorHandler.handleError(ctx, err as ErrorHandler.ErrorWCode);

      return;
    }
  });

  router.post("/:role", bodyParser(), async (ctx) => {
    try {
      const schema = schemas.getSchemaFromCtx(ctx, roleMap);
      const {
        body: { query },
      } = ctx.request;

      ctx.body = await graphql({ schema, source: query });
    } catch (err) {
      ErrorHandler.handleError(ctx, err as ErrorHandler.ErrorWCode);
      return;
    }
  });
  // end: access for client with specific role

  return router;
};

export default getRouter;
