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
