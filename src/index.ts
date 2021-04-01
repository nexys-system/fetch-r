import * as Connection from "./connection";
import * as Exec from "./exec";
import * as T from "./type";

export const run = async (): Promise<string> => {
  const s = Connection.init();

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

  s.connection.connect();

  //
  const responseWithEntites = await Exec.exec(mq, s);
  //

  console.log(responseWithEntites);

  console.log(responseWithEntites.UserAuthentication);

  //console.log(insertBp([{ countryId: 1, name: "myname", ceid: "fd" }]));
  //console.log(insertBpFromTable);
  //console.log(tableDef);
  //execQuery(tableDef);

  s.connection.end();

  return "q";
};

run();
