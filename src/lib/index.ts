// this file is used for the package. The server should use the other files directly
export * as Database from "./database/index.js";
export * as Model from "./model/index.js";
export * as Exec from "./exec.js";
export * as Type from "./type.js";
export * as QueryBuilder from "./query-builder/index.js";
export * as GraphQL from "./graphql/index.js";
export * as QueryService from "./query-service/index.js";

import Main from "./main.js";

export default Main;
