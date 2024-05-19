import { Query, Mutate, MutateResponse, ReturnUnit } from "../type.js";

import Fetchr from "../main.js";

import AbstractServiceWData from "./abstract-service-wdata.js";
import * as TA from "../query-builder/aggregate/type.js";

class QueryService extends AbstractServiceWData {
  fetchr: Fetchr;

  constructor(f: Fetchr) {
    super();

    this.fetchr = f;
  }

  data = async (query: Query): Promise<ReturnUnit> => this.fetchr.query(query);

  mutate = async (query: Mutate): Promise<MutateResponse> =>
    this.fetchr.mutate(query);

  aggregate = async (query: TA.Query): Promise<TA.ResponseAggregate> =>
    this.fetchr.aggregate(query);
}

export default QueryService;
