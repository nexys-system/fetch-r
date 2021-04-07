import fs from "fs";
import * as T from "./type";
import { JwtStructure } from "../middleware/type";

const productIdentifier = (j: Pick<JwtStructure, "product" | "env">) =>
  j.product + "_" + j.env;

const filepath = "assets/model.json";

export const init = () => JSON.parse(fs.readFileSync(filepath, "utf-8"));

const models: { [entity: string]: T.Entity[] } = init();

export const getModel = (j: Pick<JwtStructure, "product" | "env">) => {
  const model = models[productIdentifier(j)];

  if (!model) {
    throw Error("could not find model");
  }
  return model;
};

export const set = async (
  j: Pick<JwtStructure, "product" | "env">,
  model: T.Entity[]
) => {
  models[productIdentifier(j)] = model;

  await fs.promises.writeFile(filepath, JSON.stringify(models));

  return { message: "model imported" };
};
