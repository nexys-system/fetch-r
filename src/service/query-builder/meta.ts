/**
 * the system receives a query,
 * the query is transformed into a (linear) meta query,
 * the meta query is transformed into MySQL (or any SQL-like system, grammar to be adjusted)
 * teh result of the query is parsed
 */
import * as T from "../type";
import * as TT from "./type";
import * as U from "../utils";
import * as UU from "./utils";
import { RowDataPacket } from "mysql2";
import { toQuery } from "./sql";

const getField = (
  fieldName: string,
  entity: T.Entity,
  fields: T.Field[]
): T.Field => {
  const field = fields.find((f) => f.name === fieldName);

  if (!field) {
    if (fieldName === "id" && !entity.uuid) {
      return { name: "id", type: "Int", optional: false };
    }

    if (fieldName === "uuid" && entity.uuid) {
      return { name: "uuid", type: "String", optional: false };
    }
    throw Error(
      `could not find field: ${fieldName} from ${entity.name} (while creating meta query)`
    );
  }

  return field;
};

const getJoin = (modelUnit: T.Entity, field: T.Field) => ({
  entity: modelUnit.name, // name of the parent entity
  field: {
    name: field.name, // the name of the child field
    column: field.column,
    optional: field.optional, // determines if JOIN or LEFT JOIN
  },
});

export const toMeta = (
  entity: string,
  query: T.QueryParams,
  model: T.Entity[]
): TT.MetaQuery => {
  // init return object
  const ry: Omit<TT.MetaQueryUnit, "alias">[] = [];

  const addProjection = (
    entity: string,
    proj: T.QueryProjection,
    join?: TT.MetaJoin
  ) => {
    const modelUnit = UU.getModel(entity, model);
    // turn projection into object
    const projEntries = Object.entries(proj);

    // if there are no attributes in projection, add them all
    if (projEntries.length === 0 && join === undefined) {
      modelUnit.fields.forEach((f) => projEntries.push([f.name, true]));
    }

    // check primary key, if not included in projection, add it
    const primaryKey: "uuid" | "id" = modelUnit.uuid ? "uuid" : "id";
    if (!proj[primaryKey]) {
      projEntries.unshift([primaryKey, true]);
    }

    const fields: TT.MetaField[] = [];
    projEntries.forEach(([fieldName, value]) => {
      const field = getField(fieldName, modelUnit, modelUnit.fields);

      // check foreign
      if (!U.isStandardType(field.type)) {
        const join = getJoin(modelUnit, field);
        addProjection(
          field.type,
          typeof value === "boolean" ? {} : (value as T.QueryProjection),
          join
        );
      } else {
        if (typeof value === "boolean" && value === true) {
          fields.push({ name: field.name, column: U.fieldToColumn(field) });
        }
      }
    });

    const table = U.entityToTable(modelUnit);

    const unit: Omit<TT.MetaQueryUnit, "alias"> = {
      entity,
      table,
      filters: [],
      fields,
      join,
    };

    ry.push(unit);
  };

  //
  addProjection(entity, query.projection || {});
  //

  if (query.filters) {
    const addFilters = (
      entity: string,
      filters: T.QueryFilters,
      join?: TT.MetaJoin,
      aliasIdx: number = 0
    ) => {
      const modelUnit = UU.getModel(entity, model);

      const metaFilters: TT.MetaFilter[] = [];
      Object.entries(filters).forEach(([fieldName, pvalue]) => {
        const field = getField(fieldName, modelUnit, modelUnit.fields);
        // check foreign
        if (!U.isStandardType(field.type)) {
          const join = getJoin(modelUnit, field);
          addFilters(field.type, pvalue as T.QueryFilters, join, aliasIdx + 1);
          return;
        }

        const { operator, value } = UU.getValueAndOperator(pvalue);

        // opposite todo cast to {} for non query filters
        metaFilters.push({
          name: field.name,
          column: U.fieldToColumn(field),
          value,
          operator,
        });
      });

      if (metaFilters.length > 0) {
        // find an array element with the same join object
        const fFilter = ry.findIndex((x) => UU.compareJoins(join, x));

        if (fFilter > -1) {
          ry[fFilter].filters = metaFilters;
        } else {
          const table = U.entityToTable(modelUnit);

          const unit: Omit<TT.MetaQueryUnit, "alias"> = {
            entity,
            table,

            fields: [],
            filters: metaFilters,
            join,
          };
          ry.push(unit);
        }
      }
    };

    //
    addFilters(entity, query.filters);
    //
  }

  const m: TT.MetaQueryUnit[] = ry.reverse().map((x, i) => {
    // write alias
    const alias = `t${i}`;
    return { ...x, alias };
  });

  const units = m.sort((a, b) => (a.alias > b.alias ? 1 : -1));
  return { units, take: query.take, skip: query.skip, order: query.order };
};

export const createQuery = (
  query: T.Query,
  model: T.Entity[]
): { sql: string; meta: TT.MetaQuery }[] =>
  Object.entries(query).map(([entity, v]) => {
    const meta: TT.MetaQuery = toMeta(entity, v, model);
    const pSQL = toQuery(meta);
    const sql = pSQL.join("\n") + ";";
    return { sql, meta };
  });

export const parseUnit = (x: RowDataPacket, meta: TT.MetaQueryUnit[]) => {
  const hJoins = (m: TT.MetaQueryUnit, r: { [col: string]: any }) =>
    m.fields.forEach((f) => {
      const aliasName = UU.getAliasColumn(m.alias, f.name);
      r[f.name] = x[aliasName];
    });

  const recur = (parentEntity: string, r: { [col: string]: any }) =>
    meta
      .filter((x) => x.join?.entity === parentEntity)
      .forEach((m) => {
        if (m.join) {
          const attrName = m.join.field.name;
          r[attrName] = {};
          hJoins(m, r[attrName]);

          recur(m.entity, r[attrName]);
        }
      });

  const r: { [col: string]: any } = {};
  const m = meta[0];

  hJoins(m, r);
  recur(m.entity, r);

  return r;
};

export const parse = (x: RowDataPacket, meta: TT.MetaQueryUnit[]) => {
  if (!Array.isArray(x)) {
    throw Error("expecting an array");
  }
  return x.map((y) => parseUnit(y, meta));
};
