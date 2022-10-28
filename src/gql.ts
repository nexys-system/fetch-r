// run with
// ./node_modules/.bin/tsc --esModuleInterop true  src/gql.ts && node src/gql.js
import { Pool } from "postgres-pool";
import fs from "fs";

// by default the pool uses the same
// configuration as whatever `pg` version you have installed
//const pool = new Pool()

const cert = fs.readFileSync("dev-db.cert").toString();

console.log(cert);

const config = {
  host,
  database,
  user,
  password,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
    ca: cert,
  },
  max: 20, // set pool max size to 20
  idleTimeoutMillis: 1000, // close idle clients after 1 second
  connectionTimeoutMillis: 500, // return an error after 1 second if connection could not be established
  maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
};

// you can pass properties to the pool
// these properties are passed unchanged to both the node-postgres Client constructor
// and the node-pool (https://github.com/coopernurse/node-pool) constructor
// allowing you to fully configure the behavior of both

const init = async () => {
  const pool = new Pool(config);
  console.log("nit");
  // const client = await pool.connect();

  const res = await pool.query("select $1::text as name", ["pg-pool"]);
  // client.release();
  // client.end();

  console.log("hello from", res.rows[0].name);

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  await pool.end();
};

init();
