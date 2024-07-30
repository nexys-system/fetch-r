import mysql, { ResultSetHeader, RowDataPacket } from "mysql2";
import * as pg from "pg";

import * as T from "./type.js";

export class SQL {
  //connection: mysql.Connection;
  public pool: T.Pool | null;
  public poolPg: pg.Pool | null;

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

    this.pool = null;
    this.poolPg = null;

    if (databaseType === "PostgreSQL") {
      // https://node-postgres.com/apis/pool
      this.poolPg = new pg.Pool({
        host: connectionOptions.host,
        user: connectionOptions.user || (connectionOptions as any).username,
        database: connectionOptions.database,
        password: connectionOptions.password,
        port: connectionOptions.port,
        idleTimeoutMillis: 5000,
      });
    }

    if (databaseType === "MySQL") {
      // https://www.npmjs.com/package/mysql2#using-connection-pools
      //this.connection = mysql.createConnection(config);
      this.pool = mysql.createPool(connectionOptions).promise();
    }
  }

  execQuery = async (
    query: string
  ): Promise<RowDataPacket | ResultSetHeader> => {
    if (this.pool) {
      const [response] = await this.pool.query(query);

      return response as RowDataPacket | ResultSetHeader;
    }

    if (this.poolPg) {
      try {
        const r = await this.poolPg.query(query);
        // console.log(r);
        // console.log(r.command, r.fields, r.rows, r.rowCount,r.oid);

        // mutate
        if (["INSERT", "UPDATE", "DELETE"].includes(r.command)) {
          const okPacket: ResultSetHeader = {
            constructor: {
              name: "ResultSetHeader",
            },
            insertId: r.oid,
            affectedRows: r.rowCount || 0,
            fieldCount: 0,
            changedRows: 0,
            serverStatus: 0,
            info: "",
            warningStatus: 0,
            //  warningCount: 0,
            //   message: "",
            //   protocol41: false,
          };

          return okPacket;
        }

        return r.rows as RowDataPacket;
      } catch (err) {
        return Promise.reject(err);
      }
    }

    throw Error("no pool initialized");
  };
}

// stores all connections in a map, can be called on demand
export const databases: Map<string, SQL> = new Map();
