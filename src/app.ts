import Koa from "koa";

import Models from "./routes/model";
import Database from "./routes/database";
import Main from "./routes/main";
import Router from "koa-router";

const app = new Koa();

const router = new Router();

router.use("/model", Models);
router.use("/database", Database);
router.use(Main);

app.use(router.routes());

export default app;
