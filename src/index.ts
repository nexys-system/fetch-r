import app from "./app.js";
import { port } from "./config.js";

app.listen(port, () => console.log("fetch-r started on port " + port));
