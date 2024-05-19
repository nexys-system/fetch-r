import * as T from "../type.js";

export interface MetaJoin {
  entity: string;
  entityRef: EntityRef;
  field: Pick<T.Field, "name" | "column" | "optional">;
}

export interface MetaField {
  name: string;
  column: string;
  type?: T.Type; // needed to cast
}

export const metaOperators = ["=", "gt", "lt", "in", "neq", "is"]; //as const;
// https://stackoverflow.com/questions/44480644/string-union-to-string-array
// type MetaOperatorTuple = typeof (metaOperators);
// export type MetaOperator = MetaOperatorTuple[number]; //
export type MetaOperator =
  | "="
  | "gt"
  | "lt"
  | "in"
  | "neq"
  | "is"
  | "lte"
  | "gte"
  | "regexp"; // see https://dev.mysql.com/doc/refman/8.0/en/non-typed-operators.html
export interface MetaFilter extends MetaField {
  value: any;
  operator: MetaOperator;
}

export interface MetaQueryUnit {
  entity: string;
  alias: string;
  table: string;
  fields: MetaField[];
  filters: MetaFilter[];
  idx: EntityRef;
  join?: MetaJoin;
}

export interface MetaQuery {
  units: MetaQueryUnit[];
  take?: number;
  skip?: number;
  order?: T.QueryOrder;
  references?: T.References;
}

export type EntityRef = [number, number];
