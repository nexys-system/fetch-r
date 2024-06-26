import { getModel } from "./utils.js";
import * as T from "../type.js";
import * as U from "../utils.js";
import * as UU from "./utils.js";
import { DatabaseType } from "../database/type.js";

// SQL
export const getFilterUnit = (
  col: string,
  value: T.QueryFilters<any> | T.FilterAttribute,
  modelUnit: T.Entity,
  model: T.Entity[] = [],
  sep: string
): string => {
  const field = U.findField(modelUnit, col);
  // optional case
  if (!value) {
    if (field.optional === false) {
      throw Error(
        `linked field: "${field.name}" is mandatory, can't be set to NULL`
      );
    }
    return `\`${field.column}\`=NULL`;
  }

  if (!U.isStandardType(field.type)) {
    // find associated model
    const modelFk = getModel(field.type, model);

    // make sure it is an object
    if (typeof value !== "object") {
      const exampleFilter = modelFk.uuid ? '{uuid: "myuuid"}' : "{id: xx}";
      const e = `linked field: "${field.name}" was assigned a non object value. It should be like ${exampleFilter}`;
      throw Error(e);
    }

    if (
      (value as { id: number }).id &&
      typeof (value as { id: number }).id === "number"
    ) {
      return `${sep}${field.column}${sep}=${U.escape(
        (value as { id: number }).id
      )}`;
    }

    if (
      (value as { uuid: number }).uuid &&
      typeof (value as { uuid: number }).uuid === "string"
    ) {
      return `\`${field.column}\`=(SELECT id FROM \`${U.entityToTable(
        modelFk
      )}\` WHERE uuid=${U.escape((value as { uuid: number }).uuid)})`;
    }

    try {
      const f = getFilters(modelFk, value as any, model, sep);

      return `\`${field.column}\` IN (SELECT id FROM \`${U.entityToTable(
        modelFk
      )}\` WHERE ${f})`;
    } catch (err) {
      throw Error(
        `mapping error: ${field.type} - ${field.name} - ${JSON.stringify(
          value
        )}`
      );
    }
  }

  const filterValue = UU.getFilterString(value as T.FilterAttribute);

  return `${sep}${field.column}${sep}${filterValue}`;
};

const getFilters = (
  modelUnit: T.Entity,
  filters?: T.QueryFilters,
  model: T.Entity[] = [],
  sep: string = "`"
): string => {
  if (!filters) {
    return "1";
  }

  return Object.entries(filters)
    .map(([col, value]) => getFilterUnit(col, value, modelUnit, model, sep))
    .join(" AND ");
};

const getSubQuery = (field: T.Field, model: T.Entity[], v: any) => {
  const entity = getModel(field.type, model);

  // if the value is NULL and the field is optional, return "NULL"
  if (v === null) {
    if (field.optional === true) {
      return "NULL";
    }

    throw "value is null/undefined, even though the field is not optional";
  }

  const idUuid = entity.uuid ? "uuid" : "id";

  const iid = v[idUuid];

  if (!iid) {
    throw Error(
      `fetchr: could not find associated ref for ${field.name} (parent entity: ${entity.name}}. Did you forget to add the object: {id: x} instead of x`
    );
  }

  const w = entity.uuid ? U.escape(v.uuid) : Number(v.id);

  // the code can be stopped here for ID
  /*
  if (!entity.uuid) {
    return w;
  }*/

  const table = U.entityToTable(entity);

  return `(SELECT id FROM \`${table}\` WHERE ${idUuid}=${w})`;
};

const getValueInsertUnit = (
  v: any,
  field: T.Field,
  model: T.Entity[]
): string => {
  if (UU.isNull(field.optional, v)) {
    return "NULL";
  }

  if (!U.isStandardType(field.type)) {
    if (v.id && typeof v.id === "number") {
      return UU.formatSQL(v.id, "Long");
    }

    return getSubQuery(field, model, v);
  }

  // todo check option set value

  return UU.formatSQL(v, field.type);
};

/**
 * generates SQL queries (goes through the different queries)
 * @param params
 * @param modelUnit
 * @param model
 * @returns
 */
const getValuesInsert = (
  data: any,
  fields: T.Field[],
  model: T.Entity[],
  hasUuid: boolean
) => {
  const fieldsArray = fields.map((field) =>
    getValueInsertUnit(data[field.name], field, model)
  );

  if (hasUuid) {
    fieldsArray.push("UUID()");
  }

  return "(" + fieldsArray.join(", ") + ")";
};

const getValuesInsertMultiple = (
  data: any[],
  fields: T.Field[],
  model: T.Entity[],
  hasUuid: boolean
): string =>
  data.map((d) => getValuesInsert(d, fields, model, hasUuid)).join(", ");

const toQueryInsert = (
  entity: T.Entity,
  data: any,
  model: T.Entity[],
  databaseType: DatabaseType
) => {
  const fieldsArray = entity.fields.map((x) => U.fieldToColumn(x));

  if (entity.uuid) {
    fieldsArray.push("uuid");
  }

  const sep = databaseType === "PostgreSQL" ? "" : "`";

  const fields = fieldsArray.map((x) => sep + x + sep).join(", ");

  const values = Array.isArray(data)
    ? getValuesInsertMultiple(data, entity.fields, model, entity.uuid)
    : getValuesInsert(data, entity.fields, model, entity.uuid);
  const table = U.entityToTable(entity);
  const tableEscaped = table.includes("-") ? "`" + table + "`" : table;
  return `INSERT INTO ${tableEscaped} (${fields}) VALUES ${values};`;
};

const toQueryUpdate = (
  entity: T.Entity,
  data: any,
  filters: T.QueryFilters,
  model: T.Entity[],
  databaseType: DatabaseType
) => {
  const sep = databaseType === "PostgreSQL" ? "" : "`";
  const filterString = getFilters(entity, filters, model, sep);

  const values = Object.entries(data)
    .filter(([k]) => k !== "id" && k !== "uuid") // here drop id, or uuid, since they can't be updated
    .map(([k, v]) => {
      const field = entity.fields.find((x) => x.name === k);

      if (!field) {
        throw Error(`update: cannot find ${entity.name}.${k}`);
      }

      const col = sep + U.fieldToColumn(field) + sep;

      if (!U.isStandardType(field.type)) {
        // if same entity, do not link extra table
        if (field.type === entity.name && (v as { id: number }).id) {
          return col + "=" + (v as { id: number }).id;
        }

        return col + "=" + getSubQuery(field, model, v);
      }

      return `${col}=${UU.formatSQL(v, field.type)}`;
    })
    .join(", ");

  const table = U.entityToTable(entity);
  const tableEscaped = table.includes("-") ? sep + table + sep : table;

  return `UPDATE ${tableEscaped} SET ${values} WHERE ${filterString};`;
};

const toQueryDelete = (
  entity: T.Entity,
  filters: T.QueryFilters,
  model: T.Entity[],
  databaseType: DatabaseType
) => {
  const sep = databaseType === "PostgreSQL" ? "" : "`";
  const filterString = getFilters(entity, filters, model, sep);

  const table = U.entityToTable(entity);
  const tableEscaped = table.includes("-") ? "`" + table + "`" : table;
  return `DELETE FROM ${tableEscaped} WHERE ${filterString};`;
};

export const createMutateQuery = (
  query: T.Mutate,
  model: T.Entity[],
  databaseType: DatabaseType
): { type: T.MutateType; entity: T.Entity; sql: string }[] =>
  Object.entries(query)
    .map(([entity, queryParams]) => {
      const modelEntity = getModel(entity, model);

      if (queryParams.insert) {
        const type = Array.isArray(queryParams.insert.data)
          ? T.MutateType.insertMultiple
          : T.MutateType.insert;

        const insertQuery = toQueryInsert(
          modelEntity,
          queryParams.insert.data,
          model,
          databaseType
        );

        return {
          type,
          entity: modelEntity,
          sql: insertQuery,
        };
      }

      if (queryParams.update) {
        const query = toQueryUpdate(
          modelEntity,
          queryParams.update.data,
          queryParams.update.filters,
          model,
          databaseType
        );

        return {
          type: T.MutateType.update,
          entity: modelEntity,
          sql: query,
        };
      }

      if (queryParams.delete) {
        return {
          type: T.MutateType.delete,
          entity: modelEntity,
          sql: toQueryDelete(
            modelEntity,
            queryParams.delete.filters,
            model,
            databaseType
          ),
        };
      }

      return;
    })
    .filter(U.arrayNotEmpty);
