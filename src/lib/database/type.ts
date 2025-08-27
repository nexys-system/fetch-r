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

// Custom types to replace MySQL2 types
export interface ResultSetHeader {
  constructor: { name: string };
  insertId: number;
  affectedRows: number;
  fieldCount: number;
  changedRows: number;
  serverStatus: number;
  info: string;
  warningStatus: number;
}

export interface RowDataPacket {
  [column: string]: any;
}

export interface FieldPacket {
  name: string;
  type: string;
  table: string;
}

export type Response = [
  ResultSetHeader | RowDataPacket[] | RowDataPacket[][],
  FieldPacket[]
];

export type DatabaseType = "MySQL" | "PostgreSQL" | "SQLite";

export interface ConnectionOptions {
  host?: string;
  database?: string;
  user?: string;
  username?: string;
  password?: string;
  socketPath?: string;
  port?: number;
  ssl?: any;
  multipleStatements?: boolean;
  timezone?: string;
}