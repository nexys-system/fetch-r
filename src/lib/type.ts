// should be in sync with
// https://github.com/Nexysweb/lib/blob/master/src/query/types.ts
export type Type =
  | "String"
  | "Int"
  | "Long"
  | "Boolean"
  | "BigDecimal"
  | "Float"
  | "LocalDate"
  | "LocalDateTime"
  | "LocalTime";

export type Value = number | string | boolean | Date;

interface FiltersIn {
  $in: Value[];
}

interface FiltersNe {
  $ne: null | Value | Value[];
}

interface FiltersRegex {
  $regex: string;
}

export type FilterAttribute =
  | Value
  | FiltersIn
  | FiltersNe
  | FiltersRegex
  | { $lt: number }
  | { $gt: number }
  | null
  | undefined;

// same as query but extra `joinOn` params
export interface References {
  [entity: string]: QueryParams & { joinOn?: string };
}

export interface Entity {
  name: string;
  uuid: boolean;
  table?: string;
  fields: Field[];
}
export interface Field {
  type: string;
  name: string;
  column?: string;
  optional: boolean;
}

export type QueryProjection<A = any> = {
  [key in keyof A]?: boolean | QueryProjection<any>;
};

export type QueryFilters<A = any> = {
  [key in keyof A]?: FilterAttribute | QueryFilters;
};

export interface QueryOrder {
  by: string;
  desc?: boolean;
}

export interface QueryParams {
  projection?: QueryProjection;
  filters?: QueryFilters;
  references?: References;
  order?: QueryOrder;
  take?: number;
  skip?: number;
}

export interface Query {
  [entity: string]: QueryParams;
}

export interface MutateParams<A = any> {
  insert?: { data: Omit<A, "id" | "uuid"> | Omit<A, "id" | "uuid">[] };
  update?: { data: Partial<A>; filters: QueryFilters };
  delete?: { filters: QueryFilters };
}

export interface Mutate<A = any> {
  [entity: string]: MutateParams<A>;
}

export interface MutateResponseInsert {
  success: boolean;
  uuid?: string;
  id?: number;
  status?: string;
}

export interface MutateResponseUpdate {
  success: boolean;
  updated: number;
}

export interface MutateResponseDelete {
  success: boolean;
  deleted: number;
}

export interface MutateResponse {
  [entity: string]: {
    insert?: MutateResponseInsert | MutateResponseInsert[];
    update?: MutateResponseUpdate;
    delete?: MutateResponseDelete; //| MutateResponseDelete[]; for now remove this one (I don't think it is implemented anyway)
  };
}

export enum MutateType {
  insert,
  insertMultiple,
  update,
  delete,
}

export interface Join {
  entity: Entity;
  field: Field;
  parent: Entity;
  projection?: QueryProjection;
  pFields?: { name: string; column: string }[];
  alias?: string;
  parentAlias?: string;
}

export interface SQuery {
  query: string;
  entity: string;
  modelEntity: Entity;
  projection: { name: string; column: string }[];
  joins: Join[];
}

export type ReturnUnit = {
  [k: string]: any; //T.Value | null | ReturnUnit;
};
