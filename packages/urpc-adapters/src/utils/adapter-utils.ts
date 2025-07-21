import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  WhereCondition,
  WhereConditionWithOperators,
  UpsertArgs,
} from "@unilab/urpc-core";

/**
 * Match where conditions
 * @param item Data item
 * @param where Where condition
 * @returns Whether it matches
 */
export function matchesWhere<T extends Record<string, any>>(
  item: T,
  where: WhereConditionWithOperators<T> | WhereCondition<T>
): boolean {
  return Object.entries(where).every(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      // Handle query operators
      if ("$eq" in value) return item[key] === value.$eq;
      if ("$ne" in value) return item[key] !== value.$ne;
      if ("$gt" in value) return item[key] > value.$gt;
      if ("$gte" in value) return item[key] >= value.$gte;
      if ("$lt" in value) return item[key] < value.$lt;
      if ("$lte" in value) return item[key] <= value.$lte;
      if ("$in" in value) return value.$in.includes(item[key]);
      if ("$nin" in value) return !value.$nin.includes(item[key]);

      // Handle string query operators first
      const itemValue = item[key];
      if (typeof itemValue === "string") {
        const mode = value.mode || "sensitive";
        const caseSensitive = mode === "sensitive";

        // Apply case sensitivity for string comparisons
        const normalizeString = (str: string) =>
          caseSensitive ? str : str.toLowerCase();

        const normalizedItemValue = normalizeString(itemValue);

        if ("contains" in value) {
          const searchValue = normalizeString(value.contains);
          return normalizedItemValue.includes(searchValue);
        }

        if ("startsWith" in value) {
          const searchValue = normalizeString(value.startsWith);
          return normalizedItemValue.startsWith(searchValue);
        }

        if ("endsWith" in value) {
          const searchValue = normalizeString(value.endsWith);
          return normalizedItemValue.endsWith(searchValue);
        }

        if ("not" in value) {
          if (value.not === null) {
            // itemValue is a string, so it's not null
            return true;
          }
          if (typeof value.not === "string") {
            const searchValue = normalizeString(value.not);
            return normalizedItemValue !== searchValue;
          }
        }
      }

      // Handle not operator for non-string fields
      if ("not" in value) {
        if (value.not === null) {
          return item[key] !== null && item[key] !== undefined;
        }
        return item[key] !== value.not;
      }
    }
    return item[key] === value;
  });
}

/**
 * Apply sorting
 * @param items Array of data items
 * @param orderBy Sorting conditions
 * @returns Sorted array
 */
export function applySorting<T extends Record<string, any>>(
  items: T[],
  orderBy: Partial<Record<keyof T, "asc" | "desc">>
): T[] {
  return items.sort((a, b) => {
    for (const [field, direction] of Object.entries(orderBy)) {
      const aVal = a[field as keyof T];
      const bVal = b[field as keyof T];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;

      if (comparison !== 0) {
        return direction === "desc" ? -comparison : comparison;
      }
    }
    return 0;
  });
}

/**
 * Apply pagination
 * @param items Array of data items
 * @param offset Offset
 * @param limit Limit count
 * @returns Paginated array
 */
export function applyPagination<T>(
  items: T[],
  offset?: number,
  limit?: number
): T[] {
  let result = items;

  if (offset) {
    result = result.slice(offset);
  }
  if (limit) {
    result = result.slice(0, limit);
  }

  return result;
}

/**
 * Process findMany arguments
 * @param items Array of data items
 * @param args findMany arguments
 * @returns Processed array
 */
export function processFindManyArgs<T extends Record<string, any>>(
  items: T[],
  args?: FindManyArgs<T>
): T[] {
  let result = [...items];

  // Apply where conditions
  if (args?.where) {
    result = result.filter((item) => matchesWhere(item, args.where!));
  }

  // Apply ordering
  if (args?.order_by) {
    result = applySorting(result, args.order_by);
  }

  // Apply pagination
  result = applyPagination(result, args?.offset, args?.limit);

  return result;
}

/**
 * Execute upsert operation
 * @param args upsert arguments
 * @param findOne Function to find single entity
 * @param update Function to update entity
 * @param create Function to create entity
 * @returns Entity
 */
export async function performUpsert<T extends Record<string, any>>(
  args: UpsertArgs<T>,
  findOne: (args: FindOneArgs<T>) => Promise<T | null>,
  update: (args: UpdateArgs<T>) => Promise<T>,
  create: (args: CreationArgs<T>) => Promise<T>
): Promise<T> {
  const existing = await findOne({ where: args.where });

  if (existing) {
    return update({ where: args.where, data: args.update });
  } else {
    return create({ data: args.create });
  }
}
