import * as PM from "./parse-mutate";

describe("parseMutateInsert", () => {
  test("insert", () => {
    const response = {
      fieldCount: 0,
      affectedRows: 1,
      insertId: 11,
      info: "Records: 1  Duplicates: 0  Warnings: 0",
      serverStatus: 2,
      warningStatus: 0,
    };

    const e = [11];
    const r = PM.getIdsMutateInsert(response as any);
    expect(r).toEqual(e);
  });

  test("insert multiple", () => {
    const response = {
      fieldCount: 0,
      affectedRows: 2,
      insertId: 11,
      info: "Records: 2  Duplicates: 0  Warnings: 0",
      serverStatus: 2,
      warningStatus: 0,
    };

    const e = [11, 12];

    const r = PM.getIdsMutateInsert(response as any);
    expect(r).toEqual(e);
  });
});
