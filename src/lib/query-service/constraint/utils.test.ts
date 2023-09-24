import * as C from "./utils";

test("format error", () => {
  const errorString =
    "List((List(firstName),CrudFieldRequiredError(this field is required)))";
  const r = {
    firstName: ["this field is required"],
  };
  expect(C.formatErrors(errorString)).toEqual(r);
});
