import * as S from "./mutate";
import * as T from "../type";
import { get } from "../model";

const entities = get["124_1"];

describe("create mutate query", () => {
  test("simple insert", () => {
    const q: T.Mutate = { UserStatus: { insert: { data: { name: "ok" } } } };
    const s = ['INSERT INTO user_status (col_name) VALUES ("ok");'];
    expect(S.createMutateQuery(q, entities)).toEqual(s);
  });

  test("simple delete", () => {
    const q: T.Mutate = { UserStatus: { delete: { filters: { id: 2 } } } };
    const s = ["DELETE FROM user_status WHERE `id`=2;"];
    expect(S.createMutateQuery(q, entities)).toEqual(s);
  });

  test("simple update", () => {
    const q: T.Mutate = {
      UserStatus: { update: { data: { name: "ok" }, filters: { id: 2 } } },
    };
    const s = ['UPDATE user_status SET col_name="ok" WHERE `id`=2;'];
    expect(S.createMutateQuery(q, entities)).toEqual(s);
  });
});
