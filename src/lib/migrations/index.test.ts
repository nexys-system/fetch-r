import * as I from "./index.js";
import { expect, test } from "bun:test";

test("import/exports", () => {
  expect(typeof I.Migrations).toEqual("object");
  expect(typeof I.Utils).toEqual("object");
});
