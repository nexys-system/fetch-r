import * as T from "../type";
import * as TT from "./type";
import { escape } from "../utils";

export const getAliasColumn = (tableAlias: string, fieldName: string) =>
  tableAlias + "_" + fieldName;

export const getLimitStatement = ({
  take,
  skip,
}: Pick<TT.MetaQuery, "take" | "skip">): string | undefined => {
  if (!take) {
    return;
  }

  if (take < 0) {
    throw Error("take must be greater than zero");
  }

  if (skip && skip < 0) {
    throw Error("skip must be greater than zero");
  }

  return `LIMIT ${skip || 0}, ${take}`;
};

export const getOrderStatement = ({ by, desc }: T.QueryOrder) => {
  const col = getAliasColumn("t0", by);
  return `ORDER BY ${col} ${desc === true ? "DESC" : "ASC"}`;
};

export const compareJoins = (
  join: TT.MetaJoin | undefined,
  x: { join?: TT.MetaJoin }
): boolean => {
  if (join === undefined) {
    return x.join === undefined;
  }

  if (!x.join) {
    return false;
  }

  return x.join.entity === join.entity && x.join.field.name === join.field.name;
};

export const getModel = (entityName: string, model: T.Entity[]) => {
  const f = model.find((m) => m.name === entityName);

  if (!f) {
    throw Error(
      "could not find model: " + entityName + " (while creating meta query)"
    );
  }

  return f;
};

export const toOperator = (op: string): TT.MetaOperator => {
  switch (op) {
    case "$in":
      return "in";
    case "$gt":
      return "gt";
    case "$gte":
      return "gte";
    case "$lt":
      return "lt";
    case "$lte":
      return "lte";
    case "$neq":
    case "$ne":
      return "neq";
    case "$regex":
      return "regexp";
  }

  throw Error("could not map operator: " + JSON.stringify(op));
};

export const getValueAndOperator = (
  v: any
): { operator: TT.MetaOperator; value: any }[] => {
  if (v === null) {
    return [{ operator: "is", value: null }];
  }

  if (typeof v === "object") {
    return Object.entries(v).map(([preOp, value]) => {
      const operator = toOperator(preOp);
      return { operator, value };
    });
  }

  return [{ operator: "=", value: v }];
};

export const toSQLOperator = (operator: TT.MetaOperator, value?: any) => {
  switch (operator) {
    case "lt":
      return "<";
    case "gt":
      return ">";
    case "lt":
      return "<=";
    case "gt":
      return ">=";
    case "in":
      return " IN ";
    case "neq":
      if (value === null) {
        return " IS NOT ";
      }
      return "<>";

    case "is":
      return " IS ";
    case "regexp":
      return " REGEXP "; // https://dev.mysql.com/doc/refman/8.0/en/regexp.html#operator_regexp
    default:
      return "=";
  }
};

export const formatDateSQL = (v: any): string => {
  // 1 transform to JS date and then to JSON
  const d = new Date(v).toJSON();

  // 2 if result of `1` is invalid it returns `null`, error thrown
  if (d === null) {
    throw Error("date given was not recognized: " + escape(v));
  }

  // return 23 first character, to get rid of timezone indications
  // see https://stackoverflow.com/questions/22806870/incorrect-datetime-value-database-error-number-1292
  return escape(d.slice(0, 23));
};

export const formatSQL = (v: any, fieldType: T.Type) => {
  switch (fieldType) {
    case "LocalDateTime":
    case "LocalTime":
    case "LocalDate": {
      return formatDateSQL(v);
    }
    default:
      return escape(v);
  }
};

/**
 * make sure the input data is NULL from a data model perspective
 * @param optional
 * @param value
 * @returns boolean
 */
export const isNull = (optional: boolean, value?: any): boolean =>
  optional && value !== 0 && value !== false && !value;
