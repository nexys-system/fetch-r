import fs from "fs";
import { addColumnsToModel } from "../../lib/model/utils";
import * as T from "../../lib/type";
import { JwtStructure } from "../../middleware/type";

const productIdentifier = (j: Pick<JwtStructure, "product" | "env">) =>
  j.product + "_" + j.env;

const filepath = "assets/model.json";

export const init = (): { [entity: string]: T.Entity[] } => {
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch (err) {
    return {};
  }
};

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
  addColumnsToModel(model);
  models[productIdentifier(j)] = model;

  await fs.promises.writeFile(filepath, JSON.stringify(models));

  return { message: "model imported" };
};
