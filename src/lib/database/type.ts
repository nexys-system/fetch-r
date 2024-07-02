import {
  Pool as MPool,
  ResultSetHeader,
  RowDataPacket,
  FieldPacket,
  PoolOptions,
} from "mysql2/promise";

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
  ResultSetHeader | RowDataPacket[] | RowDataPacket[][],
  FieldPacket[]
];

export type DatabaseType = "MySQL" | "PostgreSQL" | "SQLite";

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
