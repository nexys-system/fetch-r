import {
  Pool as MPool,
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
  FieldPacket,
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
  OkPacket | ResultSetHeader | RowDataPacket[] | RowDataPacket[][] | OkPacket[],
  FieldPacket[]
];
