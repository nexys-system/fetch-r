import * as S from "./sql";
import * as T from "./type";
import { entities } from "./model";

describe("create  query", () => {
  test("simple select", () => {
    const q: T.Query = { UserStatus: {} };
    const s =
      "SELECT user_status.`id`, user_status.`name`\nFROM user_status\nWHERE 1;";
    const r = S.createQuery(q, entities)[0];
    expect(r.query).toEqual(s);
  });

  test("simple select w projection", () => {
    const q: T.Query = { UserStatus: { projection: {} } };
    const s = "SELECT user_status.`id`\nFROM user_status\nWHERE 1;";
    const r = S.createQuery(q, entities)[0];
    expect(r.query).toEqual(s);
  });

  test("simple select w projection and filter", () => {
    const q: T.Query = {
      UserStatus: { projection: {}, filters: { id: 2, name: "ok" } },
    };
    const s =
      'SELECT user_status.`id`\nFROM user_status\nWHERE id=2 AND name="ok";';
    const r = S.createQuery(q, entities)[0];
    expect(r.query).toEqual(s);
  });

  // todo: here both
  // user.`status_id`, and user_status.`id`
  // are fetched
  test("select w join - true", () => {
    const q: T.Query = { User: { projection: { status: true } } };
    const s = [
      "SELECT user.`uuid`, user.`status_id`, user_status.`id` as user_status_id",
      "FROM user",
      "JOIN user_status as user_status ON user_status.id = user.status_id",
      "WHERE 1;",
    ];
    const r = S.createQuery(q, entities)[0];
    expect(r.query.split("\n")).toEqual(s);
  });

  test("select w join - {}", () => {
    const q: T.Query = { User: { projection: { status: { name: true } } } };
    const s = [
      "SELECT user.`uuid`, user_status.`id` as user_status_id, user_status.`name` as user_status_name",
      "FROM user",
      "JOIN user_status as user_status ON user_status.id = user.status_id",
      "WHERE 1;",
    ];
    const r = S.createQuery(q, entities)[0];
    expect(r.query.split("\n")).toEqual(s);
  });
});

describe("create mutate query", () => {
  test("simple insert", () => {
    const q: T.Mutate = { UserStatus: { insert: { data: { name: "ok" } } } };
    const s = ['INSERT INTO user_status (name) VALUES ("ok");'];
    expect(S.createMutateQuery(q, entities)).toEqual(s);
  });

  test("simple delete", () => {
    const q: T.Mutate = { UserStatus: { delete: { filters: { id: 2 } } } };
    const s = ["DELETE FROM user_status WHERE id=2;"];
    expect(S.createMutateQuery(q, entities)).toEqual(s);
  });

  test("simple update", () => {
    const q: T.Mutate = {
      UserStatus: { update: { data: { name: "ok" }, filters: { id: 2 } } },
    };
    const s = ['UPDATE user_status SET name="ok" WHERE id=2;'];
    expect(S.createMutateQuery(q, entities)).toEqual(s);
  });
});
