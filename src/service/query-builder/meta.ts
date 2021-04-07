/**
 * the system receives a query,
 * the query is transformed into a (linear) meta query,
 * the meta query is transformed into MySQL (or any SQL-like system, grammar to be adjusted)
 * teh result of the query is parsed
 */
import * as T from "../type";
import * as TT from "./type";
import * as U from "../utils";
import { RowDataPacket } from "mysql2";

const getModel = (entityName: string, model: T.Entity[]) => {
  const f = model.find((m) => m.name === entityName);

  if (!f) {
    throw Error(
      "while creating meta query: could not find model: " + entityName
    );
  }

  return f;
};

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
      "while creating meta query: could not find field: " +
        fieldName +
        " from " +
        entity.name
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
): TT.MetaQueryUnit[] => {
  // init return object
  const r: {
    [alias: string]: TT.MetaQueryUnit;
  } = {};

  const addProjection = (
    entity: string,
    proj: T.QueryProjection,
    join?: TT.MetaJoin,
    aliasIdx: number = 0
  ) => {
    let horizontalIdx = 0; // this is to account for multiple join on the same level
    const modelUnit = getModel(entity, model);
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
      console.log(field);
      // check foreign
      if (!U.isStandardType(field.type)) {
        console.log("st");
        const join = getJoin(modelUnit, field);
        addProjection(
          field.type,
          typeof value === "boolean" ? {} : value,
          join,
          aliasIdx + 1 + horizontalIdx
        );
        horizontalIdx += 1;
      } else {
        if (typeof value === "boolean" && value === true) {
          fields.push({ name: field.name, column: U.fieldToColumn(field) });
        }
      }
    });

    const table = U.entityToTable(modelUnit);
    const alias = `t${aliasIdx}`;

    console.log({ table, alias });
    r[alias] = { entity, table, alias, filters: [], fields, join };
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
      const modelUnit = getModel(entity, model);

      const metaFilters: TT.MetaFilter[] = [];
      Object.entries(filters).forEach(([fieldName, value]) => {
        const field = getField(fieldName, modelUnit, modelUnit.fields);
        // check foreign
        if (!U.isStandardType(field.type)) {
          const join = getJoin(modelUnit, field);
          addFilters(field.type, value as T.QueryFilters, join, aliasIdx + 1);
          return;
        }

        if (true) {
          // opposite todo cast to {} for non query filters
          metaFilters.push({
            name: field.name,
            column: U.fieldToColumn(field),
            value,
          });
        }
      });

      const table = U.entityToTable(modelUnit);
      const alias = `t${aliasIdx}`;
      r[alias] = {
        entity,
        table,
        alias,
        fields: r[alias]?.fields || [],
        filters: metaFilters,
        join,
      };
    };

    //
    addFilters(entity, query.filters);
    //
  }

  const m: TT.MetaQueryUnit[] = Object.entries(r).map(
    ([alias, { entity, fields, filters, table, join }]) => {
      const mu: TT.MetaQueryUnit = {
        entity,
        table,
        alias,
        fields,
        filters,
        join,
      };
      return mu;
    }
  );

  return m.sort((a, b) => (a.alias > b.alias ? 1 : -1));
};

const getAliasColumn = (tableAlias: string, fieldName: string) =>
  tableAlias + "_" + fieldName;

export const toQuery = (meta: TT.MetaQueryUnit[]): string[] => {
  const projection: string = meta
    .map((x) =>
      x.fields
        .map(
          (y) =>
            `${x.alias}.\`${y.column}\` AS ${getAliasColumn(x.alias, y.name)}`
        )
        .join(", ")
    )
    .join(", ");
  const filters: string = meta
    .map((x, i) => {
      if (x.filters.length === 0) {
        return "1";
      }
      return x.filters
        .map((y) => `t${i}.\`${y.column}\`=${U.escape(y.value)}`)
        .join(" AND ");
    })
    .join(" AND ");

  const joins: string[] = meta.slice(1).map((x) => {
    const alias = x.alias;
    const parentAlias = meta.findIndex((m) => m.entity === x.join?.entity);
    return (
      (x.join?.field.optional ? "LEFT " : "") +
      `JOIN ${x.table} AS ${alias} ON ${alias}.id=t${parentAlias}.${x.join?.field.column}`
    );
  });

  const r = [
    "SELECT " + projection,
    "FROM " + meta[0].table + " AS " + meta[0].alias,
  ];

  joins.forEach((join) => r.push(join));
  r.push("WHERE " + filters);
  return r;
};

export const createQuery = (
  query: T.Query,
  model: T.Entity[]
): { sql: string; meta: TT.MetaQueryUnit[] }[] =>
  Object.entries(query).map(([entity, v]) => {
    const meta = toMeta(entity, v, model);
    const pSQL = toQuery(meta);
    const sql = pSQL.join("\n") + ";";
    return { sql, meta };
  });

export const parseUnit = (x: RowDataPacket, meta: TT.MetaQueryUnit[]) => {
  const hJoins = (m: TT.MetaQueryUnit, r: { [col: string]: any }) =>
    m.fields.forEach((f) => {
      const aliasName = getAliasColumn(m.alias, f.name);
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
