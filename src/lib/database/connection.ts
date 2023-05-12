import mysql from "mysql2";
import { PoolOptions } from "mysql2/typings/mysql";
import * as T from "./type";

export type ConnectionOptions = PoolOptions;

export class SQL {
  //connection: mysql.Connection;
  pool: T.Pool;

  constructor(connectionOptions: ConnectionOptions) {
    if (!connectionOptions.ssl) {
      connectionOptions.ssl = { rejectUnauthorized: false };
    }

    // see: https://dev.mysql.com/doc/mysql-port-reference/en/mysql-ports-reference-tables.html#mysql-client-server-ports
    if (!connectionOptions.port) {
      connectionOptions.port = 3306;
    }

    if (typeof connectionOptions.multipleStatements === "undefined") {
      connectionOptions.multipleStatements = true;
    }

    const config: PoolOptions = {
      ...connectionOptions,
      multipleStatements: true,
    };

    // https://www.npmjs.com/package/mysql2#using-connection-pools
    //this.connection = mysql.createConnection(config);
    this.pool = mysql.createPool(config).promise();
  }

  execQuery = (query: string): Promise<T.Response> => this.pool.query(query);
}

// stores all connections in a map, can be called on demand
export const databases: Map<string, SQL> = new Map();
