import Koa from "koa";
import Mount from "koa-mount";

import Models from "./routes/model";
import Database from "./routes/database";
import Main from "./routes/main";

const app = new Koa();

app.use(Mount("/model", Models));
app.use(Mount("/database", Database));
app.use(Mount("/", Main));

const port = 9000 || process.env.PORT;
app.listen(port, () => console.log("fetch-r started on port " + port));
