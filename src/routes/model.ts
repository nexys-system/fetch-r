import Router from "koa-router";
import bodyParser from "koa-body";

import * as Middleware from "../middleware/index.js";
import * as ModelService from "../service/model/index.js";

import * as V from "@nexys/validation";

const router: Router = new Router();

router.all(
  "/get",
  Middleware.isAuth,

  async (ctx) => {
    ctx.body = ModelService.getModel(ctx.state.jwtContent);
  }
);

const isNotEmpty = (s: string): V.Type.ErrorOut | undefined => {
  if (s.trim() === "") {
    return ["can't be empty"];
  }
};

const entityShape: V.Type.Shape = {
  name: {},
  table: { optional: true },
  uuid: { type: "boolean" },
  fields: {
    $array: {
      name: {},
      optional: { type: "boolean" },
      column: {
        optional: true,
        extraCheck: isNotEmpty,
      },
      type: {},
    },
  },
};

router.all(
  "/set",
  Middleware.isAuth,
  bodyParser(),

  async (ctx) => {
    const { body } = ctx.request;

    if (!body) {
      ctx.status = 400;
      ctx.body = { error: "payload expected" };
      return;
    }

    if (!Array.isArray(body)) {
      ctx.status = 400;
      ctx.body = { error: "expected input must be an array" };
      return;
    }

    const errors: { [entity: string]: V.Type.ErrorOut | V.Type.Error } = {};

    body.forEach((entityUnit) => {
      //   console.log(entityUnit);
      const v = V.Main.checkObject(entityUnit, entityShape, false);

      if (Object.keys(v).length > 0) {
        errors[entityUnit.name] = v;
      }
    });

    if (Object.keys(errors).length > 0) {
      ctx.status = 400;
      ctx.body = errors;
      return;
    }

    ctx.body = await ModelService.set(ctx.state.jwtContent, body);
  }
);

export default router.routes();
