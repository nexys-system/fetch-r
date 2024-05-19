import { QueryFilters as Filters, Mutate } from "../type.js";

export const paramsFromFilters = (
  filters: number | string | Filters
): Filters => {
  // typeof filters === Fitlers doesnt work
  if (typeof filters !== "string" && typeof filters !== "number") {
    return filters;
  }

  switch (typeof filters) {
    case "string":
      return { uuid: filters };
    default: {
      return { id: filters };
    }
  }
};

export const deleteById = (
  entity: string,
  id: number | string | Filters
): Mutate => {
  const filters = paramsFromFilters(id);

  return {
    [entity]: {
      delete: {
        filters,
      },
    },
  };
};

export const update = <A>(
  entity: string,
  id: number | string | Filters,
  data: Partial<A>
): Mutate<A> => {
  const filters = paramsFromFilters(id);
  return {
    [entity]: {
      update: {
        filters,
        data,
      },
    },
  };
};

export const insert = <A = any>(
  entity: string,
  data: Omit<A, "id" | "uuid"> | Omit<A, "id" | "uuid">[]
): Mutate<A> => {
  return {
    [entity]: {
      insert: {
        data,
      },
    },
  };
};

export const getList = <A = any>(
  data: { [entity: string]: A[] },
  entity: string
): A[] => {
  if (data && data.hasOwnProperty(entity)) {
    return data[entity];
  }

  throw new Error(`The requested resource \`${entity}\` does not exist`);
};

export const getFirst = <A = any>(
  data: A[],
  entity: string,
  optional: boolean = false
): A | null => {
  if (data && data.length > 0) {
    return data[0];
  }

  if (optional) {
    return null;
  }

  throw Error(`The requested entry of \`${entity}\` could not be found`);
};

export const getDetail = <A>(
  data: { [entity: string]: A[] },
  entity: string,
  optional: boolean = false
): A | null => {
  const r: A[] = getList(data, entity);
  return getFirst(r, entity, optional);
};
