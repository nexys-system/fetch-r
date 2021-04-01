import * as U from "./utils";

test("isstandardtype", () => {
  expect(U.isStandardType("BigDecimal")).toEqual(true);
  expect(U.isStandardType("whatever")).toEqual(false);
});
