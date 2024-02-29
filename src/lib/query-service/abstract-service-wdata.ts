import * as QueryUtil from "./utils";
import {
  Query,
  QueryFilters as Filters,
  Mutate,
  QueryParams as Params,
  QueryProjection as Projection,
  MutateResponse,
  MutateResponseInsert,
  References,
  MutateResponseUpdate,
  MutateResponseDelete,
} from "../type";

import AbstractService from "./abstract-service";
import { QueryConstraint } from "./constraint/type";

import * as QueryBuilder from "./constraint/query-builder";
import * as TT from "./constraint/type";
import { Entity } from "../type";
import * as TA from "./aggregate-type";
import { mutatePostProcessing } from "./constraint/utils";

type QueryResponse = any;

type Uuid = string;
type Id = number;

abstract class QueryService extends AbstractService {
  abstract data(query: Query): Promise<QueryResponse>;

  abstract mutate(query: Mutate): Promise<MutateResponse>;

  abstract aggregate(query: any): Promise<any>;

  async list<A = any>(entity: string, params: Params = {}): Promise<A[]> {
    // TODO entity: only first letter uppercase?
    const data = await this.data({ [entity]: params });
    return QueryUtil.getList(data, entity);
  }

  insert = async <A = any>(
    entity: string,
    data: Omit<A, "uuid" | "id">
  ): Promise<{ uuid: string } | { id: number }> => {
    const query = QueryUtil.insert(entity, data);

    const response: MutateResponse = await this.mutate(query);
    if (response && response[entity]) {
      const insertResponse: MutateResponseInsert = <MutateResponseInsert>(
        response[entity].insert
      );
      if (insertResponse.success) {
        const { uuid, id } = insertResponse;
        if (uuid) {
          return { uuid };
        }
        if (id) {
          return { id };
        }

        throw new Error(JSON.stringify(response));
      }

      throw new Error(JSON.stringify(response.status));
    }

    throw new Error(JSON.stringify(response));
  };

  insertId = <A = any>(
    entity: string,
    data: Omit<A, "id">
  ): Promise<{ id: number }> =>
    this.insert<A>(entity, data as Omit<A, "id" | "uuid">) as Promise<{
      id: Id;
    }>;

  async insertUuid<A = any>(
    entity: string,
    data: Omit<A, "uuid">
  ): Promise<{ uuid: string }> {
    return this.insert<A>(entity, data as Omit<A, "id" | "uuid">) as Promise<{
      uuid: Uuid;
    }>;
  }

  /**
   * insert multiple - wrapper around `mutate`
   * @param rows: already formatted rows (array)
   **/
  async insertMultiple<A = any>(
    entity: string,
    data: Omit<A, 'uuid' | 'id'>[] = []
  ): Promise<MutateResponseInsert[]> {
    if (data.length === 0) {
      throw new Error(`No rows for ${entity} provided`);
    }

    const query = QueryUtil.insert(entity, data);
    const r = await this.mutate(query);

    if (r[entity].insert && Array.isArray(r[entity].insert)) {
      const t: MutateResponseInsert[] = r[entity]
        .insert as MutateResponseInsert[];
      return t;
    }

    throw Error(
      `Something went wrong while inserting rows for ${entity} provided, see log for more information`
    );
  }

  async update<A = any>(
    entity: string,
    filters: number | string | Filters,
    data: Partial<A>
  ): Promise<MutateResponseUpdate> {
    const query: Mutate = QueryUtil.update(entity, filters, data);
    const r = await this.mutate(query);
    if (!(entity in r)) {
      throw Error("something went wrong while trying to update");
    }

    const re: { update?: MutateResponseUpdate } = r[entity];

    if (!re.update) {
      throw Error(
        "CRUD could not update, errors from https://github.com/Nexysweb/lib/blob/master/src/query/index.ts#L103"
      );
    }

    return re.update;
  }

  /**
   * this implementation of update multiple is a wrapper on top of `update` so that it can update more than one record with different filters
   * @param entity
   * @param paramsMultiple
   */
  async updateMultiple<A = any>(
    entity: string,
    paramsMultiple: { filters: number | string | Filters; data: Partial<A> }[]
  ): Promise<MutateResponseUpdate[]> {
    const r = paramsMultiple.map(
      async ({ filters, data }) => await this.update(entity, filters, data)
    );
    return Promise.all(r);
  }

  async find<A = any>(
    entity: string,
    params: Params = {},
    optional: boolean = false
  ): Promise<A> {
    const data = await this.list(entity, params);
    return QueryUtil.getFirst(data, entity, optional);
  }

  async detail<A = any>(
    entity: string,
    id: string | number,
    projection?: Projection,
    references?: References
  ): Promise<A> {
    const filters = QueryUtil.paramsFromFilters(id);
    return await this.find(entity, { filters, projection, references });
  }

  /**
   * deletes record(s)
   * @param entity entity of interest
   * @param filters : filters
   */
  async delete(
    entity: string,
    filters: number | string | Filters
  ): Promise<MutateResponseDelete> {
    const query = QueryUtil.deleteById(entity, filters);

    const r = await this.mutate(query);

    if (!(entity in r)) {
      throw Error("something went wrong while trying to delete");
    }

    const re: { delete?: MutateResponseDelete } = r[entity];

    if (!re.delete) {
      throw Error(
        "CRUD could not delete, errors from see https://github.com/Nexysweb/lib/blob/master/src/query/index.ts#L161 "
      );
    }

    return re.delete;
  }

  dataWithConstraint = async (
    query: Query,
    constraints: QueryConstraint,
    model: Entity[]
  ): Promise<QueryResponse> => {
    QueryBuilder.Data.constructQueryPermission(
      query,
      constraints.filterConstraintsMap,
      constraints.projectionConstraintsMap,
      model
    );

    // console.log(JSON.stringify(query));

    return this.data(query);
  };

  mutateWithConstraint = async (
    query: Mutate,
    constraints: TT.MutateConstraint
  ): Promise<{ status: number; body: MutateResponse | string }> => {
    console.log(JSON.stringify(query));
    query = QueryBuilder.Mutate.constructMutatePermission(
      query,
      constraints.filterConstraintsMap,
      constraints.dataConstraintsMap,
      constraints.append
    );

    console.log(JSON.stringify(query));

    try {
      const r = await this.mutate(query);

      return mutatePostProcessing(r);
    } catch (err) {
      console.error(err);
      return {
        status: 500,
        body: "internal server error when querying mutate",
      };
    }
  };

  // aggregate
  aggregateSingle = async <A>(
    entity: string,
    params: TA.Params
  ): Promise<A[]> => {
    const r = await this.aggregate({ [entity]: params });
    console.log("any otput");
    console.log(r);
    return r[entity];
  };
}

export default QueryService;
