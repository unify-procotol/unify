import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  WhereCondition,
  WhereConditionWithOperators,
} from "@unilab/core";

export type EntityConstructor<T> = new (...args: any[]) => T;

export function matchesWhere<T extends Record<string, any>>(
  entity: T,
  where: WhereConditionWithOperators<T>
): boolean {
  for (const [key, condition] of Object.entries(where)) {
    const entityValue = entity[key as keyof T];

    if (typeof condition === "object" && condition !== null) {
      // Handle query operators
      const operators = condition as any;
      if (operators.$eq !== undefined && entityValue !== operators.$eq)
        return false;
      if (operators.$ne !== undefined && entityValue === operators.$ne)
        return false;
      if (operators.$gt !== undefined && entityValue <= operators.$gt)
        return false;
      if (operators.$gte !== undefined && entityValue < operators.$gte)
        return false;
      if (operators.$lt !== undefined && entityValue >= operators.$lt)
        return false;
      if (operators.$lte !== undefined && entityValue > operators.$lte)
        return false;
      if (operators.$in !== undefined && !operators.$in.includes(entityValue))
        return false;
      if (operators.$nin !== undefined && operators.$nin.includes(entityValue))
        return false;
    } else {
      // Direct value comparison
      if (entityValue !== condition) return false;
    }
  }
  return true;
}

export function applySorting<T extends Record<string, any>>(
  entities: T[],
  orderBy: Partial<Record<keyof T, "asc" | "desc">>
): T[] {
  return entities.sort((a, b) => {
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

export function applyPagination<T>(
  entities: T[],
  offset?: number,
  limit?: number
): T[] {
  let result = entities;

  if (offset) {
    result = result.slice(offset);
  }
  if (limit) {
    result = result.slice(0, limit);
  }

  return result;
}

export function processFindManyArgs<T extends Record<string, any>>(
  entities: T[],
  args?: FindManyArgs<T>
): T[] {
  let result = entities;

  // Apply where conditions
  if (args?.where) {
    result = result.filter((entity) => matchesWhere(entity, args.where!));
  }

  // Apply ordering
  if (args?.order_by) {
    result = applySorting(result, args.order_by);
  }

  // Apply pagination
  result = applyPagination(result, args?.offset, args?.limit);

  return result;
}

export async function performUpsert<T extends Record<string, any>>(
  args: {
    where: WhereCondition<T>;
    update: Partial<T>;
    create: Partial<T>;
  },
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
