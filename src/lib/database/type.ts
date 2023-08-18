import {
  Pool as MPool,
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
  FieldPacket,
} from "mysql2/promise";
import { PoolOptions } from "mysql2/typings/mysql";

export interface Database {
  host: string;
  database: string;
  username: string;
  password: string;
  port: number;
}

export interface DatabaseOut {
  name: string;
  driver: "com.mysql.jdbc.Driver";
  url: string;
  urlOptions: {};
  username: string;
  password: string;
}

export type Pool = MPool;

export type Response = [
  OkPacket | ResultSetHeader | RowDataPacket[] | RowDataPacket[][] | OkPacket[],
  FieldPacket[]
];

export type DatabaseType = "MySQL" | "PostgreSQL";

export type ConnectionOptions = Pick<
  PoolOptions,
  | "host"
  | "database"
  | "user"
  | "password"
  | "socketPath"
  | "port"
  | "ssl"
  | "multipleStatements"
  | "timezone"
>;
