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
import { toQuery } from "./sql";
import * as L from "./legacy";

const getField = (
  fieldName: string,
  entity: T.Entity,
  fields: T.Field[]
): T.Field => {
  const field = fields.find((f) => f.name === fieldName);

  if (!field) {
    // id always included (needed for references later)
    if (fieldName === "id") {
      return { name: "id", type: "Int", optional: false };
    }

    if (entity.uuid && fieldName === "uuid") {
      return { name: "uuid", type: "String", optional: false };
    }
    throw Error(
      `could not find field: ${fieldName} from ${entity.name} (while creating meta query)`
    );
  }

  return field;
};

const getJoin = (
  modelUnit: T.Entity,
  field: T.Field,
  entityRef: TT.EntityRef,
  isParentOptional: boolean = false
): TT.MetaJoin => ({
  entity: modelUnit.name, // name of the parent entity
  entityRef,
  field: {
    name: field.name, // the name of the child field
    column: field.column,
    optional: field.optional || isParentOptional, // determines if JOIN or LEFT JOIN
  },
});

export const toMeta = (
  entity: string,
  query: T.QueryParams,
  model: T.Entity[]
): TT.MetaQuery => {
  // init return object
  const ry: Omit<TT.MetaQueryUnit, "alias">[] = [];

  /**
   *
   * @param entity
   * @param proj
   * @param join
   * @param depth : join depth: e.g. city (0) => country (1) => continent (2)
   */
  const addProjection = (
    entity: string,
    proj: T.QueryProjection,
    join?: TT.MetaJoin,
    aliasIdx: number = 0,
    depth: number = 0
  ) => {
    const modelUnit = UU.getModel(entity, model);
    // turn projection into object
    const projEntries = Object.entries(proj);

    // if there are no attributes in projection, add them all
    if (projEntries.length === 0 && join === undefined) {
      modelUnit.fields.forEach(({ name }) => projEntries.push([name, true]));
    }

    // uuid added if entity supports it
    if (modelUnit.uuid && !proj["uuid"]) {
      projEntries.unshift(["uuid", true]);
    }

    // check primary key, if not included in projection, add it
    // id always included
    // note: this comes after to have ids at the start of the list of fields (use of unshift)
    if (!proj["id"]) {
      projEntries.unshift(["id", true]);
    }

    const fields: TT.MetaField[] = [];
    let aaIdx = aliasIdx;
    projEntries.forEach(([fieldName, value]) => {
      const field = getField(fieldName, modelUnit, modelUnit.fields);
      // console.log({ field });

      // check foreign
      if (!U.isStandardType(field.type)) {
        // this is a trick and important statement: if the parent join was optional, the current one must be optional as well. Else we will rule out expected results
        const isParentJoinOptional = join ? join.field.optional : false;
        //console.log(modelUnit.name, join);
        const currentJoin = getJoin(
          modelUnit,
          field,
          toEntityRef(aliasIdx, depth),
          isParentJoinOptional
        );

        addProjection(
          field.type,
          typeof value === "boolean" ? {} : (value as T.QueryProjection),
          currentJoin,
          aaIdx,
          depth + 1
        );

        aaIdx++;
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
      idx: [aliasIdx, depth],
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
      aliasIdx: number = 0,
      depth: number = 0
    ) => {
      const modelUnit = UU.getModel(entity, model);

      const metaFilters: TT.MetaFilter[] = [];
      let aaIdx = aliasIdx;
      Object.entries(filters).forEach(([fieldName, pvalue]) => {
        const field = getField(fieldName, modelUnit, modelUnit.fields);
        // check foreign
        if (!U.isStandardType(field.type) && pvalue !== null) {
          const join = getJoin(modelUnit, field, toEntityRef(aliasIdx, depth));

          addFilters(
            field.type,
            pvalue as T.QueryFilters,
            join,
            aaIdx,
            depth + 1
          );
          aaIdx++;
          return;
        }

        UU.getValueAndOperator(pvalue).map(({ operator, value }) => {
          // opposite todo cast to {} for non query filters
          metaFilters.push({
            name: field.name,
            column: U.fieldToColumn(field),
            value,
            operator,
          });
        });
      });

      if (metaFilters.length > 0) {
        // find an array element with the same join object
        const fFilter = ry.findIndex((x) => UU.compareJoins(join, x));

        if (fFilter > -1) {
          ry[fFilter].filters = metaFilters;
        } else {
          const table = U.entityToTable(modelUnit);

          const idUuid: TT.MetaField = modelUnit.uuid
            ? { name: "uuid", column: "uuid" }
            : { name: "id", column: "id" };

          const unit: Omit<TT.MetaQueryUnit, "alias"> = {
            entity,
            table,
            fields: [idUuid],
            filters: metaFilters,
            idx: [aliasIdx, depth],
            join,
          };

          // unshift allows not to break the logic that assumes that the main query is the last one, see reverse below
          ry.unshift(unit);
        }
      }
    };

    //
    addFilters(entity, query.filters);
    //
  }

  // reverse list and add alias based on position
  // STRONG ASSUMPTION: the main entity is at the bottom of the list due to the way the recurring logic is designed in projection
  const m: TT.MetaQueryUnit[] = ry
    //.reverse()
    .sort(sortUnit)
    .map((x, i) => ({ ...x, alias: `t${i}` }));

  const units = m.sort(sortAlias);

  // console log all the different units, this is crucial to debug queries
  //units.map((x) => console.log(x));

  return {
    units,
    take: query.take,
    skip: query.skip,
    order: query.order,
    references: query.references,
  };
};

const sortUnit = (a: { idx: TT.EntityRef }, b: { idx: TT.EntityRef }): number =>
  a.idx[0] * 1000 + a.idx[1] - b.idx[0] * 1000 - b.idx[1];

const toEntityRef = (aIdx: number, depth: number): TT.EntityRef => [
  aIdx,
  depth,
];

const sortAlias = (a: { alias: string }, b: { alias: string }): 1 | -1 =>
  Number(a.alias.slice(1)) > Number(b.alias.slice(1)) ? 1 : -1;

export const toMetas = (query: T.Query, model: T.Entity[]): TT.MetaQuery[] =>
  Object.entries(query).map(([entity, v]) => {
    const meta: TT.MetaQuery = toMeta(entity, v, model);

    return meta;
  });

export const createQuery = (
  query: T.Query,
  model: T.Entity[],
  legacyMode: boolean = false
): { sql: string; meta: TT.MetaQuery }[] => {
  const oEntries = Object.entries(query);

  if (oEntries.length === 0) {
    throw Error(
      "query empty, this error is also thrown if the references object is given empty"
    );
  }

  return oEntries.map(([entity, params]) => {
    // here integrate legacy mode
    if (legacyMode) {
      L.augment(entity, params.projection || {}, model);
    }

    const meta: TT.MetaQuery = toMeta(entity, params, model);
    const pSQL = toQuery(meta);
    const sql = pSQL.join("\n") + ";";
    return { sql, meta };
  });
};

export const createSQL = (
  metas: TT.MetaQuery[]
): { sql: string; meta: TT.MetaQuery }[] => {
  return metas.map((meta) => {
    const pSQL = toQuery(meta);
    const sql = pSQL.join("\n") + ";";
    return { sql, meta };
  });
};
