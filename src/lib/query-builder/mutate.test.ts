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

interface Permission {
  uuid: string;
  name: string;
}

describe("create mutate query", () => {
  test("simple insert", () => {
    const data: Omit<UserStatus, "id"> = { name: "ok" };
    const q: T.Mutate<UserStatus> = { UserStatus: { insert: { data } } };
    const s = ["INSERT INTO user_status (`col_name`) VALUES ('ok');"];
    const sm = S.createMutateQuery(q, model);
    expect(sm.map((_) => _.sql)).toEqual(s);
  });

  test("simple insert with uuid", () => {
    const data: Omit<Permission, "uuid"> = { name: "mypermission" };
    const q: T.Mutate<Permission> = { Permission: { insert: { data } } };
    const s = [
      "INSERT INTO permission (`name`, `uuid`) VALUES ('mypermission', UUID());",
    ];
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
      "INSERT INTO user (`first_name`, `last_name`, `middle_name`, `email`, `status_id`, `log_date_added`, `instance_id`, `lang`, `uuid`) VALUES ('John', 'Doe', NULL, 'john@doe.com', 3, '2015-11-05T13:29:36.000', (SELECT id FROM `instance` WHERE uuid='myuuid'), 'en', UUID());",
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
      "INSERT INTO user (`first_name`, `last_name`, `middle_name`, `email`, `status_id`, `log_date_added`, `instance_id`, `lang`, `uuid`)",
      `VALUES`,
      `('John', 'Doe', NULL, 'john@doe.com', 3, '2015-11-05T13:29:36.000', (SELECT id FROM \`instance\` WHERE uuid='myuuid'), 'en', UUID()),`,
      `('Jane', 'Doe', NULL, 'jane@doe.com', 2, '2015-11-05T13:29:36.000', (SELECT id FROM \`instance\` WHERE uuid='myuuid2'), 'de', UUID());`,
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
    const s = ["UPDATE user_status SET `col_name`='ok' WHERE `id`=2;"];
    const sm = S.createMutateQuery(q, model);
    expect(sm.map((x) => x.sql)).toEqual(s);
  });

  test("simple update (with obsolete id)", () => {
    const q: T.Mutate<UserStatus> = {
      UserStatus: {
        update: { data: { id: 1, name: "ok" }, filters: { id: 2 } },
      },
    };
    const s = ["UPDATE user_status SET `col_name`='ok' WHERE `id`=2;"];
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
      "UPDATE module_lesson SET `is_mandatory`=0 WHERE `lesson_id`=2495 AND `module_id`=553;",
    ];
    const sm = S.createMutateQuery(q, model2);
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
      "UPDATE module_lesson SET `is_mandatory`=0 WHERE `lesson_id`=2495 AND `module_id`=553;",
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
      "UPDATE user SET `first_name`='Jane', `instance_id`=(SELECT id FROM `instance` WHERE uuid='myuuid'), `status_id`=(SELECT id FROM `user_status` WHERE id=3) WHERE `uuid`='useruuid';",
    ];
    const sm = S.createMutateQuery(q, model);
    expect(sm.map((x) => x.sql)).toEqual(s);
  });
});

test("update with 2nd level filter", () => {
  const query = {
    ModuleLesson: {
      update: {
        data: {
          isMandatory: 1,
        },
        filters: {
          lesson: {
            reference: {
              id: 2495,
            },
          },
          module: {
            id: 553,
          },
        },
      },
    },
  };

  const s: string[] = [
    "UPDATE module_lesson SET `is_mandatory`=1 WHERE `lesson_id` IN (SELECT id FROM `lesson` WHERE `ref_id`=2495) AND `module_id`=553;",
  ];
  const sm = S.createMutateQuery(query, model2);
  expect(sm.map((x) => x.sql)).toEqual(s);
});

test("update special case when referring to the same table/entity", () => {
  const q = {
    Lesson: {
      update: {
        data: {
          reference: {
            id: 544,
          },
        },
        filters: {
          id: 720,
        },
      },
    },
  };
  const s: string[] = ["UPDATE lesson SET `ref_id`=544 WHERE `id`=720;"];
  const sm = S.createMutateQuery(q, model2);
  expect(sm.map((x) => x.sql)).toEqual(s);
});

test("update with IN operator", () => {
  const q: T.Mutate<UserStatus> = {
    UserStatus: {
      update: { data: { name: "ok" }, filters: { id: { $in: [1, 2, 3] } } },
    },
  };
  const s = ["UPDATE user_status SET `col_name`='ok' WHERE `id` IN (1,2,3);"];
  const sm = S.createMutateQuery(q, model);
  expect(sm.map((x) => x.sql)).toEqual(s);
});

test("update with IN operator", () => {
  const q: T.Mutate<UserStatus> = {
    UserStatus: {
      update: { data: { name: "ok" }, filters: { id: { $gt: 1 } } },
    },
  };
  const s = ["UPDATE user_status SET `col_name`='ok' WHERE `id`>1;"];
  const sm = S.createMutateQuery(q, model);
  expect(sm.map((x) => x.sql)).toEqual(s);
});

describe("get filter unit", () => {
  const modelUnit = model.find((x) => x.name === "User");
  if (!modelUnit) {
    throw Error("");
  }
  test("optional value, nut non optional field", () => {
    try {
      S.getFilterUnit("firstName", null, modelUnit, model);
    } catch (err) {
      expect(typeof (err as any).message).toEqual("string");
    }
  });

  test(" simple string value", () => {
    const r = S.getFilterUnit("firstName", "john", modelUnit, model);
    expect(r).toEqual("`first_name`='john'");
  });

  test("fk value", () => {
    const r = S.getFilterUnit("instance", { uuid: "myuuid" }, modelUnit, model);
    expect(r).toEqual(
      "`instance_id`=(SELECT id FROM `instance` WHERE uuid='myuuid')"
    );
  });
});

describe("update with null", () => {
  test("update a value to null", () => {
    const q = {
      Module: {
        update: {
          data: {
            points: 30,
            tag: null,
            externalId: 6000,
          },
          filters: {
            id: 516,
          },
        },
      },
    };

    const [t] = S.createMutateQuery(q, model2);

    expect(t.sql).toEqual(
      "UPDATE module SET `points`=30, `tag_id`=NULL, `external_id`=6000 WHERE `id`=516;"
    );
  });

  test("update a value to null, forbidden", () => {
    const q = {
      Module: {
        update: {
          data: {
            status: null,
          },
          filters: {
            id: 516,
          },
        },
      },
    };

    try {
      S.createMutateQuery(q, model2);
    } catch (err) {
      expect(err).toEqual(
        "value is null/undefined, even though the field is not optional"
      );
    }
  });
});
