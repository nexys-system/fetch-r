import fs from "fs";
import { JwtStructure } from "../../middleware/type";
import * as T from "../../lib/database/type";
import * as Connection from "../../lib/database/connection";

//

const productIdentifier = (j: Pick<JwtStructure, "product" | "env">) =>
  j.product + "_" + j.env;

const filepath = "assets/database.json";

export const init = (): { [entity: string]: T.Database } => {
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch (err) {
    return {};
  }
};

const databases: { [entity: string]: T.Database } = init();

export const set = async (
  j: Pick<JwtStructure, "product" | "env">,
  database: T.Database
) => {
  databases[productIdentifier(j)] = database;

  await fs.promises.writeFile(filepath, JSON.stringify(databases));

  return { message: "database imported" };
};

export const get = (j: Pick<JwtStructure, "product" | "env">) => {
  const db = databases[productIdentifier(j)];

  if (!db) {
    throw Error("could not find database");
  }
  return db;
};

export const getPool = (
  j: Pick<JwtStructure, "product" | "env">
): Connection.SQL => {
  const db = get(j);

  const pid = productIdentifier(j);

  const pool = Connection.databases.get(pid);

  if (!pool) {
    const connection = {
      host: db.host,
      user: db.username,
      password: db.password,
      port: db.port,
      database: db.database,
    };

    const pool = new Connection.SQL(connection);
    Connection.databases.set(pid, pool);

    return pool;
  }

  return pool;
};
