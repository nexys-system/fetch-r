import * as T from "../type";

export interface MetaJoin {
  entity: string;
  field: Pick<T.Field, "name" | "column" | "optional">;
}

export interface MetaField {
  name: string;
  column: string;
}

export interface MetaFilter extends MetaField {
  value: any;
}

export interface MetaQueryUnit {
  entity: string;
  alias: string;
  table: string;
  fields: MetaField[];
  filters: MetaFilter[];
  join?: MetaJoin;
}
