import * as Meta from "../query-builder/meta";
import * as TT from "../query-builder/type";
import * as Exec from "../exec";
import { Entity, Field, References, ReturnUnit } from "../type";
import * as Connection from "../database/connection";

interface Ref {
  entity: string;
  mainUnit: TT.MetaQueryUnit;
  ids: number[];
}

export const prepareRefUnit = (
  parentEntity: string,
  main: ReturnUnit[],
  q: { sql: string; meta: TT.MetaQuery },
  joinOn?: string
): { entity: string; mainUnit: TT.MetaQueryUnit; ids: number[] } => {
  // creating new filter

  // console.log(JSON.stringify(q, null, 2));

  // mainUnit: main entity of parent query

  // get entity in ref that is same as parent
  const observedUnit = q.meta.units.find(
    (x) =>
      x.entity === parentEntity && (!joinOn || x.join?.field.name === joinOn)
  );

  if (!observedUnit) {
    // could not find the block to which the query should refer to
    // todo add referenced entity to the list of units
    // by default join on `id`, but it can be overriden with `joinOn`

    throw Error(
      "something went wrong when mapping entities with reference block: " +
        parentEntity
    );
  }

  // get list of ids to filter with
  // note: for now, does not support uuid
  const ids: number[] = main.map((row) => row.id);

  const metaFilter: TT.MetaFilter = {
    value: ids,
    operator: "in",
    column: "id",
    name: "id",
  };

  observedUnit.filters.push(metaFilter);

  // mainUnit: main entity of ref query
  const [mainUnit] = q.meta.units;

  return {
    entity: observedUnit.entity,
    mainUnit, // not to be confused with parent entity
    ids,
  };
};

export const getFieldUnit = (
  { joinOn }: { joinOn?: string },
  modelUnit: Entity,
  refEntity: string
): Field => {
  // by default join on `id`, but it can be overriden with `joinOn`
  // todo: check that field actually exists

  const fieldUnit = modelUnit.fields.find(
    (f) => f.type === refEntity && (!joinOn || f.name === joinOn)
  );

  if (!fieldUnit) {
    throw Error(
      `could not apply joinOn - field misspelt? ref.entity=${refEntity} joinOn=${joinOn}`
    );
  }

  return fieldUnit;
};

/**
 * add parent entity, in case a custom projection was added
 * @param references
 * @param model
 * @param parentEntity
 */
export const augmentRefQuery = (
  references: References,
  model: Entity[],
  parentEntity: string
) =>
  Object.entries(references).forEach(([entity, { projection }]) => {
    // only relevant if projection is defined, else all attributes are added
    // console.log({ projection, entity });
    if (projection) {
      const modelUnit = model.find((x) => x.name === entity);

      if (!modelUnit) {
        throw Error(
          "could find the entity that is linked with the main entity"
        );
      }

      const fieldRefMain = modelUnit.fields.find(
        (x) => x.type === parentEntity
      );

      if (!fieldRefMain) {
        throw Error(
          "could find the attribute that is linked with the main entity"
        );
      }

      projection[fieldRefMain.name] = {};
    }
  });

export const prepare = async (
  meta: TT.MetaQuery,
  main: ReturnUnit[],
  references: References,
  model: Entity[],
  s: Connection.SQL
): Promise<ReturnUnit[]> => {
  // create meta query from reference query
  const { entity: parentEntity } = meta.units[0];

  augmentRefQuery(references, model, parentEntity);

  const qs = Meta.createQuery(references, model);

  // adding filter
  const refs: Ref[] = qs.map((q) => {
    // need to find the entity to match the joinOn in references
    const { entity: refEntity } = q.meta.units[0];
    const { joinOn } = references[refEntity];
    return prepareRefUnit(parentEntity, main, q, joinOn);
  });

  const metas = qs.map((x) => x.meta);

  const qs2 = Meta.createSQL(metas);
  //console.log("qs2", qs2);
  const subResult: ReturnUnit = await Exec.execFromMeta(qs2, model, s);

  return refs.map((ref) => {
    //console.log(ref);
    const modelUnit = model.find((m) => m.name === ref.mainUnit.entity);
    if (!modelUnit) {
      throw Error("Reference: could not find model for the right entity");
    }

    const fieldUnit = getFieldUnit(
      references[ref.mainUnit.entity],
      modelUnit,
      ref.entity
    );

    //console.log(fieldUnit);

    return main.map((m) => {
      const entity = ref.mainUnit.entity;
      //console.log({ entity });
      //console.log(ref.mainUnit);
      //console.log(subResult);
      const subResultEntity = subResult[entity];

      if (subResultEntity) {
        const filteredSubResult = subResultEntity.filter((x: any) => {
          return m.id === x[fieldUnit.name].id;
        });

        m[entity] = filteredSubResult === {} ? [] : filteredSubResult;

        return m;
      }
    });
  });
};
