import mysql from "mysql2";
import {
  Pool,
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
  FieldPacket,
} from "mysql2/promise";

import * as Config from "./config";

type Response = [
  OkPacket | ResultSetHeader | RowDataPacket[] | RowDataPacket[][] | OkPacket[],
  FieldPacket[]
];

export class SQL {
  //connection: mysql.Connection;
  pool: Pool;

  constructor(
    host: string,
    user: string,
    password: string,
    database: string,
    port: number
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

  execQuery = (query: string): Promise<Response> => this.pool.query(query);
}

export const init = () =>
  new SQL(
    Config.database.host,
    Config.database.username,
    Config.database.password,
    Config.database.database,
    Config.database.port
  );
