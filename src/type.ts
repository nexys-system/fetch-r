// should be in sync with
// https://github.com/Nexysweb/lib/blob/master/src/query/types.ts
export type Type =
  | "String"
  | "Int"
  | "Boolean"
  | "BigDecimal"
  | "Float"
  | "LocalDate"
  | "LocalDateTime"
  | "LocalTime";

interface FiltersIn {
  $in: (number | string | boolean | Date)[];
}

interface FiltersNe {
  $ne: null | number | string | boolean | Date;
}

export type FilterAttribute =
  | string
  | boolean
  | number
  | Date
  | FiltersIn
  | FiltersNe
  | null;

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

export interface QueryProjection {
  [field: string]: boolean | QueryProjection;
}

export interface QueryFilters {
  [attr: string]: FilterAttribute | QueryFilters;
}

export interface QueryParams {
  projection?: QueryProjection;
  filters?: QueryFilters;
  references?: References;
  order?: { by: string; desc?: boolean };
  take?: number;
  skip?: number;
}

export interface Query {
  [entity: string]: QueryParams;
}

export interface Mutate {
  [entity: string]: {
    insert?: { data: any };
    update?: { data: any; filters: QueryFilters };
    delete?: { filters: QueryFilters };
  };
}

export interface MutateResponseInsert {
  success: boolean;
  uuid?: string;
  id?: number;
  status?: string;
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

export interface Join {
  entity: Entity;
  field: Field;
  parent: Entity;
  projection?: QueryProjection;
  pFields?: { name: string; column: string }[];
}

export interface SQuery {
  query: string;
  entity: string;
  modelEntity: Entity;
  projection: { name: string; column: string }[];
  joins: Join[];
}

export interface Migration {
  name: string;
  sql: string;
  version: number;
  idx: number;
}

export interface MigrationRow {
  checksum: number;
  description: string;
  execution_time: number;
  installed_by: string;
  installed_on: Date;
  installed_rank: number;
  script: string;
  success: number;
  type: string;
  version: string;
}
