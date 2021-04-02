import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const { HOST, DBUSER, PASSWORD, DATABASE, PORT } = process.env;

if (!HOST || !DBUSER || !PASSWORD || !DATABASE) {
  throw Error("{HOST, USER, PASSWORD, DATABASE} undefined");
}

const port: number = Number(PORT) || 3306;

export class SQL {
  connection: mysql.Connection;

  constructor(host: string, user: string, password: string, database: string) {
    const config = {
      host,
      user,
      password,
      database,
      port,
      multipleStatements: true,
    };

    //console.log(config);

    this.connection = mysql.createConnection(config);

    //console.log(this.connection);
  }

  execQuery = <
    A extends
      | mysql.RowDataPacket[]
      | mysql.RowDataPacket[][]
      | mysql.OkPacket
      | mysql.OkPacket[]
      | mysql.ResultSetHeader
  >(
    query: string
  ): Promise<A> =>
    new Promise((r) => {
      this.connection.query(query, (error, results) => {
        if (error) throw error;

        r(results as A);
      });
    });
}

export const init = () => new SQL(HOST, DBUSER, PASSWORD, DATABASE);
