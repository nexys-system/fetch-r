import mysql from "mysql2";

import * as T from "./type";

export class SQL {
  //connection: mysql.Connection;
  pool: T.Pool;

  constructor(
    connectionOptions: T.ConnectionOptions,
    databaseType: T.DatabaseType
  ) {
    // remove ssl by default
    /*if (!connectionOptions.ssl) {
      connectionOptions.ssl = { rejectUnauthorized: false };
    }*/

    // see: https://dev.mysql.com/doc/mysql-port-reference/en/mysql-ports-reference-tables.html#mysql-client-server-ports
    if (!connectionOptions.port) {
      // default port are different depending on the database type
      if (databaseType === "PostgreSQL") {
        connectionOptions.port = 5432;
      }

      if (databaseType === "MySQL") {
        connectionOptions.port = 3306;
      }
    }

    if (databaseType === "PostgreSQL") {
      // here reference the postgresl stuff
      // return "pool" equivalent object
    }

    // fallback to SQL

    if (typeof connectionOptions.multipleStatements === "undefined") {
      connectionOptions.multipleStatements = true;
    }

    if (typeof connectionOptions.timezone === "undefined") {
      // https://stackoverflow.com/a/60883634/1659569
      // "GMT" throws: Ignoring invalid timezone passed to Connection: GMT. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection
      connectionOptions.timezone = "+00:00";
    }

    // https://www.npmjs.com/package/mysql2#using-connection-pools
    //this.connection = mysql.createConnection(config);
    this.pool = mysql.createPool(connectionOptions).promise();
  }

  execQuery = (query: string): Promise<T.Response> => this.pool.query(query);
}

// stores all connections in a map, can be called on demand
export const databases: Map<string, SQL> = new Map();

export type DatabaseType = "MySQL" | "PostgreSQL";
