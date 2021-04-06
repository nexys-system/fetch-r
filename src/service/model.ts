import fs from "fs";
import * as T from "./type";

const models = JSON.parse(fs.readFileSync("assets/model.json", "utf-8"));

export const get: { [entity: string]: T.Entity[] } = models;
