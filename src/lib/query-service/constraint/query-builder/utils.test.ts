import * as U from "./utils";

test("random string", () => {
  expect(U.generateString(12).length).toEqual(12);
  expect(U.generateString(23).length).toEqual(23);
});
