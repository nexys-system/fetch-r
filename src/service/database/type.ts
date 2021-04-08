export interface Database {
  host: string;
  database: string;
  //"driver": "com.mysql.jdbc.Driver",
  //url: string;
  //"urlOptions": {},
  username: string;
  password: string;
  port: number;
}

export interface DatabaseOut {
  name: string;
  driver: "com.mysql.jdbc.Driver";
  url: string;
  urlOptions: {};
  username: string;
  password: string;
}
