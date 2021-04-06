import * as Connection from "./connection";
import * as Exec from "./exec";
import * as T from "./type";

const mq: T.Query = {
  Instance: {
    projection: { dateAdded: true },
    filters: { name: "nexys" },
  },
  UserStatus: { filters: { id: 2 } },
  User: {
    projection: {
      firstName: true,
      lastName: true,
      status: { name: true },
      instance: { name: true },
    },
  },
  UserAuthentication: {
    projection: {
      value: true,
      user: {
        firstName: true,
        lastName: true,
        instance: { name: true },
        status: {},
      },
    },
  },
};

const mq2 = { UserAuthentication: {} };

const iq = {
  UserStatus: { insert: { data: { name: "m1!" } } },
};

export const run = async (): Promise<void> => {
  const s = Connection.init();

  s.connection.connect();

  //const t = await Exec.mutate(iq, s);
  //console.log(JSON.stringify(t, null, 2));

  const t2 = await Exec.exec(mq2, s);
  console.log(JSON.stringify(t2));
  //await Exec.execWithTime(mq, s);
  //await Exec.execWithTime(mq2, s);
  //await Exec.execWithTime(mq2, s);
  //await Exec.execWithTime(mq2, s);
  //await Exec.execWithTime({ Instance: {} }, s);

  s.connection.end();
};

run();
