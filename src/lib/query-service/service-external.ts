/**
 * this service allows to use the external fetchr service
 */
/// <reference lib="dom" />
import { Query, Mutate, MutateResponse } from "../type.js";
import * as TF from "../type.js";
import AbstractServiceWData from "./abstract-service-wdata.js";
import * as TA from "../query-builder/aggregate/type.js";

const hostDefault = "https://crud.nexys.io";

type QueryResponse = any;

class QueryServiceExternal extends AbstractServiceWData {
  host: string;
  appToken: string;
  dataModel: TF.Entity[];

  constructor(
    appToken: string,
    dataModel: TF.Entity[],
    host: string = hostDefault
  ) {
    super();

    this.host = host;
    this.appToken = appToken;
    this.dataModel = dataModel;
  }

  request = async <A>(
    path: string,
    method: "GET" | "POST",
    data?: any
  ): Promise<A> => {
    const url = this.host + path;

    const body: string | undefined = data ? JSON.stringify(data) : undefined;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.appToken,
    };

    const r = await fetch(url, {
      method,
      body,
      headers,
    });

    return r.json();
  };

  data = async (query: Query): Promise<QueryResponse> =>
    this.request("/data", "POST", query);

  mutate = async (query: Mutate): Promise<MutateResponse> =>
    this.request("/mutate", "POST", query);

  aggregate = async (query: TA.Query): Promise<TA.ResponseAggregate> => {
    console.warn("this is an experimental feature, do not push on prod");
    return this.request("/aggregate", "POST", query);
  };

  // meta
  // get and set model
  modelSet = async (): Promise<{ message: string }> =>
    this.request("/model/set", "POST", this.dataModel);

  modelGet = async (): Promise<TF.Entity[]> =>
    this.request("/model/get", "GET");
}

export default QueryServiceExternal;
