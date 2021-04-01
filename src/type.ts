export type Type =
  | "String"
  | "Int"
  | "Boolean"
  | "BigDecimal"
  | "Float"
  | "LocalDate"
  | "LocalDateTime"
  | "LocalTime";

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

export interface QueryProjection {
  [field: string]: boolean | QueryProjection;
}

export interface QueryFilters {
  [field: string]: number | Date | string | QueryFilters;
}

export interface QueryParams {
  projection?: QueryProjection;
  filters?: QueryFilters;
}

export interface Query {
  [entity: string]: QueryParams;
}
