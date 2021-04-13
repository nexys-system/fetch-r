import * as T from "../type";
import * as TT from "./type";

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
    case "$lt":
      return "lt";
    case "$neq":
    case "$ne":
      return "neq";
  }

  throw Error("could not map operator");
};

export const getValueAndOperator = (
  v: any
): { operator: TT.MetaOperator; value: any } => {
  if (typeof v === "object") {
    const [b] = Object.entries(v);

    const operator = toOperator(b[0]);
    return { operator, value: b[1] };
  }

  return { operator: "=", value: v };
};
