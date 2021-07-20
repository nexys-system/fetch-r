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

export const prepareOrderStatement = (metaQuery: TT.MetaQuery) => {
  const { order } = metaQuery;

  if (!order) {
    // this code should be unattainable since we check for this upstream
    throw Error("order is not defined");
  }

  const { by, desc } = order;
  const byOrderArray = by.split(".");

  const byOrderArrayLength = byOrderArray.length;

  if (byOrderArrayLength === 1) {
    return getOrderStatement(by, desc);
  }

  if (byOrderArrayLength > 1) {
    const entityOrder = byOrderArray[byOrderArrayLength - 2];
    const fieldOrder = byOrderArray[byOrderArrayLength - 1];
    const unit = metaQuery.units.find((x) => x.entity === entityOrder);

    if (!unit) {
      throw Error("could not find entity for order: " + byOrderArray.join("."));
    }

    const { alias } = unit;

    return getOrderStatement(fieldOrder, desc, alias);
  }

  throw Error("could not figure out the order statement: " + by);
};

/**
 * @param fieldOrder: `by` statement
 * @param desc: order direction: {true:desc, false:ASC}
 * @param alias: table alias (needs to be linked with an already defined unit
 */
export const getOrderStatement = (
  fieldOrder: string,
  desc?: boolean,
  alias: string = "t0"
): string => {
  const col = getAliasColumn(alias, fieldOrder);
  const direction: "DESC" | "ASC" = desc === true ? "DESC" : "ASC";
  return `ORDER BY ${col} ${direction}`;
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
      if (value === null || value === undefined) {
        return " IS NOT ";
      }

      if (Array.isArray(value)) {
        return " IS NOT IN ";
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

/**
 * removes all ids from object, recursively
 * @param a
 */
export const removeId = (a: { [k: string]: any }): void => {
  const keys = Object.keys(a);

  if (keys.includes("uuid")) {
    delete a["id"];
  }

  keys.forEach((k) => {
    if (typeof a[k] === "object" && a[k] !== null) {
      removeId(a[k]);
    }
  });
};

export const compareIdx = (a: TT.EntityRef, b: TT.EntityRef): boolean =>
  a[1] === b[1] && a[0] === b[0];

/**
 * finds unit that is linked
 * note:that the comparison needs to happen at entity, and entityref levels. Some entityrefs are sometimes not unique
 */
export const findUnit = (
  x: { join?: { entityRef: TT.EntityRef; entity: string } },
  m: { idx: TT.EntityRef; entity: string }
): boolean =>
  !!x.join && m.entity === x.join.entity && compareIdx(m.idx, x.join.entityRef);
