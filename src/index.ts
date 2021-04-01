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
      status: {},
      instance: { name: true },
    },
  },
  UserAuthentication: {
    projection: { user: { firstName: true, instance: {} } },
  },
};

export const run = async (): Promise<void> => {
  const s = Connection.init();

  s.connection.connect();

  //
  const responseWithEntites = await Exec.exec(mq, s);
  //

  console.log(responseWithEntites);
  console.log(responseWithEntites.UserAuthentication);

  s.connection.end();
};

run();
