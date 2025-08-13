import {
  BaseAdapter,
  FindManyArgs,
  FindOneArgs,
  OperationContext,
  URPCError,
  ErrorCodes,
  WhereConditionWithOperators,
} from "@unilab/urpc-core";
import { PoolManager } from "../lib/pool-manager";

export class PgAdapter<T extends Record<string, any>> extends BaseAdapter<T> {
  static displayName = "PgAdapter";

  private poolManager: PoolManager;
  private tableName: string;
  private schemaName: string;

  constructor(
    poolManager: PoolManager,
    tableName: string,
    schemaName: string = "public"
  ) {
    super();
    this.poolManager = poolManager;
    this.tableName = tableName;
    this.schemaName = schemaName;
  }

  async findMany(args?: FindManyArgs<T>, ctx?: OperationContext): Promise<T[]> {
    try {
      let query = `SELECT * FROM ${this.schemaName}.${this.tableName}`;
      const values: any[] = [];
      let paramCount = { count: 0 };

      if (args?.where) {
        const whereCondition = buildWhereConditions(
          args.where,
          values,
          paramCount
        );
        if (whereCondition.length > 0) {
          query += ` WHERE ${whereCondition}`;
        }
      }

      // Add ORDER BY if provided
      if (args?.order_by) {
        const orderClauses: string[] = [];
        for (const [key, direction] of Object.entries(args.order_by)) {
          if (direction) {
            if (typeof direction === "string") {
              // Simple field sorting
              orderClauses.push(`"${key}" ${direction.toUpperCase()}`);
            } else if (
              typeof direction === "object" &&
              direction.path &&
              direction.sortOrder
            ) {
              // JSON path sorting
              const pathString = direction.path.map((p) => `"${p}"`).join(",");
              orderClauses.push(
                `("${key}"#>'{${pathString}}') ${direction.sortOrder.toUpperCase()}`
              );
            }
          }
        }
        if (orderClauses.length > 0) {
          query += ` ORDER BY ${orderClauses.join(", ")}`;
        }
      }

      // Add LIMIT if provided
      if (args?.limit != null) {
        query += ` LIMIT $${++paramCount.count}`;
        values.push(args.limit);
      }

      // Add OFFSET if provided
      if (args?.offset != null) {
        query += ` OFFSET $${++paramCount.count}`;
        values.push(args.offset);
      }

      const result = await this.poolManager.query(query, values);
      return result.rows;
    } catch (error) {
      throw new URPCError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to find records: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async findOne(
    args: FindOneArgs<T>,
    ctx?: OperationContext
  ): Promise<T | null> {
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      for (const [key, value] of Object.entries(args.where)) {
        conditions.push(`"${key}" = $${++paramCount}`);
        values.push(value);
      }

      if (conditions.length === 0) {
        throw new URPCError(
          ErrorCodes.BAD_REQUEST,
          "Where clause is required for findOne"
        );
      }

      const query = `SELECT * FROM ${this.schemaName}.${
        this.tableName
      } WHERE ${conditions.join(" AND ")} LIMIT 1`;
      const result = await this.poolManager.query(query, values);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      if (error instanceof URPCError) {
        throw error;
      }
      throw new URPCError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to find record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

function buildWhereConditions(
  whereClause: WhereConditionWithOperators<any>,
  values: any[],
  paramCount: { count: number }
): string {
  if (!whereClause || typeof whereClause !== "object") {
    return "";
  }

  const conditions: string[] = [];

  // Handle OR operator
  if (whereClause.OR && Array.isArray(whereClause.OR)) {
    const orConditions = whereClause.OR.map((orClause: any) =>
      buildWhereConditions(orClause, values, paramCount)
    ).filter((condition: string) => condition.length > 0);

    if (orConditions.length > 0) {
      conditions.push(`(${orConditions.join(" OR ")})`);
    }
  }

  // Handle AND operator
  if (whereClause.AND && Array.isArray(whereClause.AND)) {
    const andConditions = whereClause.AND.map((andClause: any) =>
      buildWhereConditions(andClause, values, paramCount)
    ).filter((condition: string) => condition.length > 0);

    if (andConditions.length > 0) {
      conditions.push(`(${andConditions.join(" AND ")})`);
    }
  }

  // Helper function to handle JSON path casting for numeric comparisons
  const buildTypedColumnRef = (
    key: string,
    path?: any[],
    value?: any
  ): string => {
    if (path && Array.isArray(path)) {
      const pathString = path.map((p: any) => `"${p}"`).join(",");
      // Cast to appropriate type based on value type
      if (typeof value === "number") {
        return `("${key}"#>>'{${pathString}}')::numeric`;
      }
      return `("${key}"#>>'{${pathString}}')`;
    }
    return `"${key}"`;
  };

  // Handle field conditions
  for (const [key, value] of Object.entries(whereClause)) {
    if (key === "OR" || key === "AND") {
      continue; // Skip logical operators, already handled above
    }

    if (typeof value === "object" && value !== null) {
      // Handle operators like eq, ne, etc.
      const operators = value;

      if (operators.eq !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.eq
        );
        conditions.push(`${columnRef} = $${++paramCount.count}`);
        values.push(operators.eq);
      }
      if (operators.ne !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.ne
        );
        conditions.push(`${columnRef} != $${++paramCount.count}`);
        values.push(operators.ne);
      }
      if (operators.gt !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.gt
        );
        conditions.push(`${columnRef} > $${++paramCount.count}`);
        values.push(operators.gt);
      }
      if (operators.gte !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.gte
        );
        conditions.push(`${columnRef} >= $${++paramCount.count}`);
        values.push(operators.gte);
      }
      if (operators.lt !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.lt
        );
        conditions.push(`${columnRef} < $${++paramCount.count}`);
        values.push(operators.lt);
      }
      if (operators.lte !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.lte
        );
        conditions.push(`${columnRef} <= $${++paramCount.count}`);
        values.push(operators.lte);
      }
      if (operators.in !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.in[0]
        );
        conditions.push(
          `${columnRef} IN (${operators.in
            .map((_: any) => `$${++paramCount.count}`)
            .join(", ")})`
        );
        values.push(...operators.in);
      }
      if (operators.nin !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.nin[0]
        );
        conditions.push(
          `${columnRef} NOT IN (${operators.nin
            .map((_: any) => `$${++paramCount.count}`)
            .join(", ")})`
        );
        values.push(...operators.nin);
      }
      if (operators.contains !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.contains
        );
        if (operators.mode === "insensitive") {
          conditions.push(`${columnRef} ILIKE $${++paramCount.count}`);
          values.push(`%${operators.contains}%`);
        } else {
          conditions.push(`${columnRef} LIKE $${++paramCount.count}`);
          values.push(`%${operators.contains}%`);
        }
      }
      if (operators.startsWith !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.startsWith
        );
        if (operators.mode === "insensitive") {
          conditions.push(`${columnRef} ILIKE $${++paramCount.count}`);
          values.push(`${operators.startsWith}%`);
        } else {
          conditions.push(`${columnRef} LIKE $${++paramCount.count}`);
          values.push(`${operators.startsWith}%`);
        }
      }
      if (operators.endsWith !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.endsWith
        );
        if (operators.mode === "insensitive") {
          conditions.push(`${columnRef} ILIKE $${++paramCount.count}`);
          values.push(`%${operators.endsWith}`);
        } else {
          conditions.push(`${columnRef} LIKE $${++paramCount.count}`);
          values.push(`%${operators.endsWith}`);
        }
      }
      if (operators.not !== undefined) {
        const columnRef = buildTypedColumnRef(
          key,
          operators.path,
          operators.not
        );
        if (operators.not === null) {
          conditions.push(`${columnRef} IS NOT NULL`);
        } else {
          conditions.push(`${columnRef} != $${++paramCount.count}`);
          values.push(operators.not);
        }
      }
    } else {
      conditions.push(`"${key}" = $${++paramCount.count}`);
      values.push(value);
    }
  }

  return conditions.join(" AND ");
}
