import * as Q from "./mutate.js";

test("constructMutatePermission", () => {
  const q = { User: { insert: { data: {} } } };
  const append = { logDateAdded: "2020-09-04" };
  const q2 = { User: { insert: { data: { ...append } } } };
  expect(Q.constructMutatePermission(q, new Map(), new Map(), append)).toEqual(
    q2
  );
});
