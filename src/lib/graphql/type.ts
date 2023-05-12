import * as GL from "graphql";
import { QueryFilters, QueryProjection } from "../type";

export interface FieldOption {
  id: number;
  name: string;
}

export type FieldType =
  | "String"
  | "Boolean"
  | "Int"
  | "Float"
  | "LocalDateTime"
  | "LocalDate"
  | "BigDecimal"
  | "Double"
  | "Long";

export type GLTypes = Map<
  string,
  {
    objectType: GL.GraphQLObjectType;
    args: GL.GraphQLFieldConfigArgumentMap;
    argsPartial: GL.GraphQLFieldConfigArgumentMap;
  }
>;

// https://graphql.org/graphql-js/basic-types/
export type GLBasicType = "ID" | "String" | "Boolean" | "Int" | "Float";

export interface ModelConstraints {
  [entity: string]: { projection?: QueryProjection; filters?: QueryFilters };
}

export interface GField {
  [field: string]: {} | GField;
}

export type Submodel<Permission> = [
  Permission,
  (v: { Instance: string | number; User: string | number }) => ModelConstraints
];
