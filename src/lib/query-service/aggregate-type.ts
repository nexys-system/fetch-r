import { QueryFilters } from "../type";

export type AggregateOperator = "$count" | "$sum" | "$avg" | "$min" | "$max";

export type SQLAggregatorOperator = "COUNT" | "SUM" | "AVG" | "MIN" | "MAX";

export interface ProjectionAggregate {
  [k: string]:
    | boolean
    | {
        $aggregate: AggregateOperator | { [alias: string]: AggregateOperator };
      };
}

export interface Params {
  projection: ProjectionAggregate;
  filters: QueryFilters;
}

export interface Query {
  [entity: string]: Params;
}
