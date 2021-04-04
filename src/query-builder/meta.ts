import * as T from "../type";
import * as U from "../utils";

interface MetaJoin {
  entity: string;
  field: string;
  optional: boolean;
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

const getField = (fieldName: string, entityName: string, fields: T.Field[]) => {
  const field = fields.find((f) => f.name === fieldName);

  if (!field) {
    throw Error(
      "while creating meta query: could not find field: " +
        fieldName +
        " from " +
        entityName
    );
  }

  return field;
};

const getJoin = (modelUnit: T.Entity, field: T.Field) => {
  const join = {
    entity: modelUnit.name, // name of the parent entity
    field: field.name, // the name of the child field
    optional: field.optional, // determines if JOIN or LEFT JOIN
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

  if (query.projection) {
    const addProjection = (
      entity: string,
      proj: T.QueryProjection,
      join?: MetaJoin,
      aliasIdx: number = 0
    ) => {
      const modelUnit = getModel(entity, model);
      const fields: MetaField[] = [];
      Object.entries(proj).forEach(([fieldName, value]) => {
        const field = getField(fieldName, entity, modelUnit.fields);

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
    addProjection(entity, query.projection);
    //
  }

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
        const field = getField(fieldName, entity, modelUnit.fields);
        // check foreign
        if (!U.isStandardType(field.type)) {
          const join = getJoin(modelUnit, field);
          addFilters(field.type, value as T.QueryFilters, join);
          return;
        }

        if (true) {
          // oppoiste todo cast to {} for non query filters
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
        fields: r[alias].fields || [],
        filters: metaFilters,
        join,
      };
    };

    //
    addFilters(entity, query.filters);
    //
  }

  const m: MetaQueryUnit[] = Object.entries(r).map(
    ([alias, { entity, fields, table, join }]) => {
      const mu: MetaQueryUnit = {
        entity,
        table,
        alias,
        fields,
        filters: [],
        join,
      };
      return mu;
    }
  );

  return m.sort((a, b) => (a > b ? 1 : -1));
};
export const toQuery = (meta: MetaQueryUnit[]) => {
  const projection: string = meta
    .map((x) => x.fields.map((y) => `${x.alias}.${y.column}`).join(", "))
    .join(", ");
  const filters: string = meta
    .map((x, i) => {
      if (x.filters.length === 0) {
        return "1";
      }
      return x.filters.map((y) => `t${i}.${y.column}=${y.value}`).join(", ");
    })
    .join(" AND ");

  const joins: string = meta
    .slice(1)
    .map((x, i) => {
      const alias = "t" + i;
      const parentAlias = meta.findIndex((m) => m.entity === x.join?.entity);
      return (
        (x.join?.optional ? "LEFT " : "") +
        `JOIN ${x.table} as ${alias} ON ${alias}.id=${parentAlias}=${x.join?.field}`
      );
    })
    .join("\n");

  return [
    "SELECT " + projection,
    "FROM " + meta[0].table,
    joins,
    "WHERE " + filters,
  ];
};
