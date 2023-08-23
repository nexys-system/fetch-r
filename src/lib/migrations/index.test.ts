import * as I from "./index";

test("import/exports", () => {
  expect(typeof I.Migrations).toEqual("object");
  expect(typeof I.Utils).toEqual("object");
});
