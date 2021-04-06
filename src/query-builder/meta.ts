import * as T from "../type";
import * as U from "../utils";

interface MetaJoin {
  entity: string;
  field: Pick<T.Field, "name" | "column" | "optional">;
}

interface MetaField {
  name: string;
  column: string;
}

interface MetaFilter extends MetaField {
  value: any;
}

export interface MetaQueryUnit {
  entity: string;
  alias: string;
  table: string;
  fields: MetaField[];
  filters: MetaFilter[];
  join?: MetaJoin;
}

const getModel = (entityName: string, model: T.Entity[]) => {
  const f = model.find((m) => m.name === entityName);

  if (!f) {
    throw Error("while creating meta query: could not find model" + entityName);
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

const getJoin = (modelUnit: T.Entity, field: T.Field) => {
  const join = {
    entity: modelUnit.name, // name of the parent entity
    field: {
      name: field.name, // the name of the child field
      column: field.column,
      optional: field.optional, // // determines if JOIN or LEFT JOIN
    },
  };

  return join;
};

export const toMeta = (
  entity: string,
  query: T.QueryParams,
  model: T.Entity[]
): MetaQueryUnit[] => {
  // init return object
  const r: {
    [alias: string]: MetaQueryUnit;
  } = {};

  const addProjection = (
    entity: string,
    proj: T.QueryProjection,
    join?: MetaJoin,
    aliasIdx: number = 0
  ) => {
    const modelUnit = getModel(entity, model);
    // turn projection into object
    const projEntries = Object.entries(proj);

    // if there are no attributes in projection, add them all
    if (projEntries.length === 0) {
      modelUnit.fields.forEach((f) => projEntries.push([f.name, true]));
    }

    // check primary key, if not included in projection, add it
    const primaryKey: "uuid" | "id" = modelUnit.uuid ? "uuid" : "id";
    if (!proj[primaryKey]) {
      projEntries.unshift([primaryKey, true]);
    }

    const fields: MetaField[] = [];
    projEntries.forEach(([fieldName, value]) => {
      const field = getField(fieldName, modelUnit, modelUnit.fields);

      // check foreign
      if (!U.isStandardType(field.type)) {
        const join = getJoin(modelUnit, field);
        addProjection(
          field.type,
          typeof value === "boolean" ? {} : value,
          join,
          aliasIdx + 1
        );
        return;
      }

      if (typeof value === "boolean" && value === true) {
        fields.push({ name: field.name, column: U.fieldToColumn(field) });
      }
    });

    const table = U.entityToTable(modelUnit);
    const alias = `t${aliasIdx}`;
    r[alias] = { entity, table, alias, filters: [], fields, join };
  };

  //
  addProjection(entity, query.projection || {});
  //

  if (query.filters) {
    const addFilters = (
      entity: string,
      filters: T.QueryFilters,
      join?: MetaJoin,
      aliasIdx: number = 0
    ) => {
      const modelUnit = getModel(entity, model);

      const metaFilters: MetaFilter[] = [];
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

  const m: MetaQueryUnit[] = Object.entries(r).map(
    ([alias, { entity, fields, filters, table, join }]) => {
      const mu: MetaQueryUnit = {
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

  return m.sort((a, b) => (a > b ? 1 : -1));
};
export const toQuery = (meta: MetaQueryUnit[]): string[] => {
  const projection: string = meta
    .map((x) =>
      x.fields
        .map((y) => `${x.alias}.\`${y.column}\` AS ${x.alias}_${y.name}`)
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
