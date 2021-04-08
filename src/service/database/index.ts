import { JwtStructure } from "../../middleware/type";
import * as Config from "./config";
import * as T from "./type";

const productIdentifier = (j: Pick<JwtStructure, "product" | "env">) =>
  j.product + "_" + j.env;

export const get = (j: Pick<JwtStructure, "product" | "env">) => {
  console.log(`for: ${productIdentifier(j)}`);
  const out = Config.database;

  return out;
};

export const set = async (
  _j: Pick<JwtStructure, "product" | "env">,
  _database: T.Database
) => {
  return { message: "todo" };
};
