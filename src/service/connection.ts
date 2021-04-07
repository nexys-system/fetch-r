import mysql from "mysql2";
import dotenv from "dotenv";
import {
  Pool,
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
  FieldPacket,
} from "mysql2/promise";

type Response = [
  OkPacket | ResultSetHeader | RowDataPacket[] | RowDataPacket[][] | OkPacket[],
  FieldPacket[]
];

dotenv.config();

const { HOST, DBUSER, PASSWORD, DATABASE, PORT } = process.env;

if (!HOST || !DBUSER || !PASSWORD || !DATABASE) {
  throw Error("{HOST, USER, PASSWORD, DATABASE} undefined");
}

const port: number = Number(PORT) || 3306;

export class SQL {
  //connection: mysql.Connection;
  pool: Pool;

  constructor(host: string, user: string, password: string, database: string) {
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

export const init = () => new SQL(HOST, DBUSER, PASSWORD, DATABASE);
