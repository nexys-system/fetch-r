import * as T from "./type";
import dotenv from "dotenv";

dotenv.config();

const { HOST, DBUSER, PASSWORD, DATABASE, PORT } = process.env;

const port: number = isNaN(Number(PORT)) ? Number(PORT) : 3306;

if (!HOST || !DBUSER || !PASSWORD || !DATABASE) {
  throw Error("{HOST, USER, PASSWORD, DATABASE} undefined");
}

export const database: T.Database = {
  host: HOST,
  username: DBUSER,
  password: PASSWORD,
  database: DATABASE,
  port,
};
