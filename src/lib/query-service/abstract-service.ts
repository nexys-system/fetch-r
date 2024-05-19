import * as TQ from "../";

abstract class QueryService {
  abstract list<A = any>(entity: string, params?: any): Promise<A[]>;

  abstract detail<A = any>(entity: string, params?: any): Promise<A>;

  abstract find<A = any>(
    entity: string,
    params: any,
    optional: boolean
  ): Promise<A>;

  abstract insert<A>(
    entity: string,
    data: Omit<A, "uuid" | "id">
  ): Promise<{ uuid: string } | { id: number }>;

  abstract insertId<A>(
    entity: string,
    data: Omit<A, "id">
  ): Promise<{ id: number }>;

  abstract insertUuid<A>(
    entity: string,
    data: Omit<A, "uuid">
  ): Promise<{ uuid: string }>;

  abstract insertMultiple<A>(
    entity: string,
    data: Omit<A, "uuid" | "id">[]
  ): Promise<TQ.Type.MutateResponseInsert[]>;

  abstract update<A>(
    entity: string,
    filters: Partial<number | string | TQ.Type.QueryFilters>,
    data: Partial<A>
  ): Promise<TQ.Type.MutateResponseUpdate>;

  abstract delete(a: any, b: any): Promise<TQ.Type.MutateResponseDelete>;
}

export { QueryService };

export default QueryService;
