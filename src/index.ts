import { port } from "./config.js";
import { createServer } from "./app.js";

createServer();

console.log(`fetch-r started on port ${port}`);