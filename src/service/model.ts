import fs from "fs";
import * as T from "./type";
import { JwtStructure } from "../middleware/type";

const models: { [entity: string]: T.Entity[] } = JSON.parse(
  fs.readFileSync("assets/model.json", "utf-8")
);

export const getModel = (j: Pick<JwtStructure, "product" | "env">) => {
  const model = models[j.product + "_" + j.env];

  if (!model) {
    throw Error("could not find model");
  }
  return model;
};
