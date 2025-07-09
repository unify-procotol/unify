import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  WhereCondition,
  WhereConditionWithOperators,
  UpsertArgs,
} from "@unilab/urpc-core";

/**
 * 匹配 where 条件
 * @param item 数据项
 * @param where where 条件
 * @returns 是否匹配
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
    }
    return item[key] === value;
  });
}

/**
 * 应用排序
 * @param items 数据项数组
 * @param orderBy 排序条件
 * @returns 排序后的数组
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
 * 应用分页
 * @param items 数据项数组
 * @param offset 偏移量
 * @param limit 限制数量
 * @returns 分页后的数组
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
 * 处理 findMany 参数
 * @param items 数据项数组
 * @param args findMany 参数
 * @returns 处理后的数组
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
 * 执行 upsert 操作
 * @param args upsert 参数
 * @param findOne 查找单个实体的函数
 * @param update 更新实体的函数
 * @param create 创建实体的函数
 * @returns 实体
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