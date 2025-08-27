import { expect, test } from "bun:test";
import * as C from "./utils.js";

test("format error", () => {
  const errorString =
    "List((List(firstName),CrudFieldRequiredError(this field is required)))";
  const r = {
    firstName: ["this field is required"],
  };
  expect(C.formatErrors(errorString)).toEqual(r);
});
