import {
  BaseAdapter,
  FindManyArgs,
  FindOneArgs,
  OperationContext,
  URPCError,
  ErrorCodes,
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
      let paramCount = 0;

      if (args?.where) {
        const conditions: string[] = [];
        for (const [key, value] of Object.entries(args.where)) {
          if (typeof value === "object" && value !== null) {
            // Handle operators like $eq, $ne, etc.
            if (value.$eq !== undefined) {
              conditions.push(`${key} = $${++paramCount}`);
              values.push(value.$eq);
            }
            // Add more operators as needed
          } else {
            conditions.push(`${key} = $${++paramCount}`);
            values.push(value);
          }
        }
        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(" AND ")}`;
        }
      }

      // Add ORDER BY if provided
      if (args?.order_by) {
        const orderClauses: string[] = [];
        for (const [key, direction] of Object.entries(args.order_by)) {
          if (direction) {
            orderClauses.push(`${key} ${direction.toUpperCase()}`);
          }
        }
        if (orderClauses.length > 0) {
          query += ` ORDER BY ${orderClauses.join(", ")}`;
        }
      }

      // Add LIMIT if provided
      if (args?.limit != null) {
        query += ` LIMIT $${++paramCount}`;
        values.push(args.limit);
      } else {
        query += ` LIMIT 10`;
      }

      // Add OFFSET if provided
      if (args?.offset != null) {
        query += ` OFFSET $${++paramCount}`;
        values.push(args.offset);
      } else {
        query += ` OFFSET 0`;
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
        if (typeof value === "object" && value !== null) {
          if (value.$eq !== undefined) {
            conditions.push(`${key} = $${++paramCount}`);
            values.push(value.$eq);
          }
        } else {
          conditions.push(`${key} = $${++paramCount}`);
          values.push(value);
        }
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
