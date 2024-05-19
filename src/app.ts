import Koa from "koa";
import Router from "koa-router";

import Models from "./routes/model.js";
import Database from "./routes/database.js";
import Main from "./routes/main.js";
import GraphQlRoutes from "./routes/graphql.js";

const app = new Koa();

const router = new Router();

router.use("/model", Models);
router.use("/database", Database);
router.use("/graphql", GraphQlRoutes);
router.use(Main);

app.use(router.routes());

export default app;
