import * as S from "./mutate";
import * as T from "../type";
import model from "./model-user";
import model2 from "./model-academy";

interface User {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  instance: { uuid: string };
  status: { id: number };
  logDateAdded: Date;
  lang: string;
}

interface UserStatus {
  id: number;
  name: string;
}

describe("create mutate query", () => {
  test("simple insert", () => {
    const data: Omit<UserStatus, "id"> = { name: "ok" };
    const q: T.Mutate<UserStatus> = { UserStatus: { insert: { data } } };
    const s = ['INSERT INTO user_status (col_name) VALUES ("ok");'];
    const sm = S.createMutateQuery(q, model);
    expect(sm.map((_) => _.sql)).toEqual(s);
  });

  test("insert with fk", () => {
    const datestring = "2015-11-05T13:29:36.000Z";
    const data: Omit<User, "uuid"> = {
      firstName: "John",
      lastName: "Doe",
      email: "john@doe.com",
      logDateAdded: new Date(datestring),
      lang: "en",
      instance: { uuid: "myuuid" },
      status: { id: 3 },
    };
    const q: T.Mutate<User> = {
      User: { insert: { data } },
    };

    const s = [
      `INSERT INTO user (first_name, last_name, email, status_id, log_date_added, instance_id, lang) VALUES ("John", "Doe", "john@doe.com", (SELECT id FROM \`user_status\` WHERE id=3), "2015-11-05T13:29:36.000Z", (SELECT id FROM \`instance\` WHERE uuid="myuuid"), "en");`,
    ];
    const ss = S.createMutateQuery(q, model);
    expect(ss.map((_) => _.sql)).toEqual(s);
  });

  test("insert with fk multiple", () => {
    const datestring = "2015-11-05T13:29:36.000Z";
    const data: Omit<User, "uuid"> = {
      firstName: "John",
      lastName: "Doe",
      email: "john@doe.com",
      logDateAdded: new Date(datestring),
      lang: "en",
      instance: { uuid: "myuuid" },
      status: { id: 3 },
    };

    const data2: Omit<User, "uuid"> = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@doe.com",
      logDateAdded: new Date(datestring),
      lang: "de",
      instance: { uuid: "myuuid2" },
      status: { id: 2 },
    };
    const q: T.Mutate<User> = {
      User: { insert: { data: [data, data2] } },
    };

    const s = [
      `INSERT INTO user (first_name, last_name, email, status_id, log_date_added, instance_id, lang)`,
      `VALUES`,
      `("John", "Doe", "john@doe.com", (SELECT id FROM \`user_status\` WHERE id=3), "2015-11-05T13:29:36.000Z", (SELECT id FROM \`instance\` WHERE uuid="myuuid"), "en"),`,
      `("Jane", "Doe", "jane@doe.com", (SELECT id FROM \`user_status\` WHERE id=2), "2015-11-05T13:29:36.000Z", (SELECT id FROM \`instance\` WHERE uuid="myuuid2"), "de");`,
    ].join(" ");
    const ss = S.createMutateQuery(q, model)[0];

    expect(ss.sql).toEqual(s);
  });

  test("simple delete", () => {
    const q: T.Mutate = { UserStatus: { delete: { filters: { id: 2 } } } };
    const s = ["DELETE FROM user_status WHERE `id`=2;"];
    const sm = S.createMutateQuery(q, model);
    expect(sm.map((x) => x.sql)).toEqual(s);
  });

  test("simple update", () => {
    const q: T.Mutate<UserStatus> = {
      UserStatus: { update: { data: { name: "ok" }, filters: { id: 2 } } },
    };
    const s = ['UPDATE user_status SET col_name="ok" WHERE `id`=2;'];
    const sm = S.createMutateQuery(q, model);
    expect(sm.map((x) => x.sql)).toEqual(s);
  });

  test("simple update FK in filter", () => {
    const q: T.Mutate = {
      ModuleLesson: {
        update: {
          data: { isMandatory: 0 },
          filters: { lesson: { id: 2495 }, module: { id: 553 } },
        },
      },
    };
    const s = [
      "UPDATE module_lesson SET is_mandatory=0 WHERE `lesson_id`=2495 AND `module_id`=553;",
    ];
    const sm = S.createMutateQuery(q, model2);
    expect(sm.map((x) => x.sql)).toEqual(s);
  });

  test("update with fk", () => {
    const data: Partial<User> = {
      firstName: "Jane",
      instance: { uuid: "myuuid" },
      status: { id: 3 },
    };

    const q: T.Mutate<User> = {
      User: { update: { data, filters: { uuid: "useruuid" } } },
    };

    const s = [
      'UPDATE user SET first_name="Jane", instance_id=(SELECT id FROM `instance` WHERE uuid="myuuid"), status_id=(SELECT id FROM `user_status` WHERE id=3) WHERE `uuid`="useruuid";',
    ];
    const sm = S.createMutateQuery(q, model);
    expect(sm.map((x) => x.sql)).toEqual(s);
  });
});
