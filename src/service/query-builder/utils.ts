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

  return `LIMIT ${skip || 0}, ${take || 0}`;
};

export const getOrderStatement = ({ by, desc }: T.QueryOrder) => {
  const col = getAliasColumn("t0", by);
  return `ORDER BY ${col} ${desc === true ? "DESC" : "ASC"}`;
};
