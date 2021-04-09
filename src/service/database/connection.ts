import mysql from "mysql2";
import * as T from "./type";

export class SQL {
  //connection: mysql.Connection;
  pool: T.Pool;

  constructor(
    host: string,
    user: string,
    password: string,
    database: string,
    port: number = 3306
  ) {
    const config = {
      host,
      user,
      password,
      database,
      port,
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
