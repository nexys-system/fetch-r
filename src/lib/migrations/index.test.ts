import * as I from "./index.js";

test("import/exports", () => {
  expect(typeof I.Migrations).toEqual("object");
  expect(typeof I.Utils).toEqual("object");
});
