import Koa from "koa";
import Router from "koa-router";

import Models from "./routes/model";
import Database from "./routes/database";
import Main from "./routes/main";
import GraphQlRoutes from "./routes/graphql";

const app = new Koa();

const router = new Router();

router.use("/model", Models);
router.use("/database", Database);
router.use("/graphql", GraphQlRoutes);
router.use(Main);

app.use(router.routes());

export default app;
