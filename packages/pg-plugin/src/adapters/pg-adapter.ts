import {
  BaseAdapter,
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  CreateManyArgs,
  UpdateArgs,
  UpdateManyArgs,
  DeletionArgs,
  UpsertArgs,
  UpsertManyArgs,
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

  // Implement BaseAdapter methods
  async findMany(args?: FindManyArgs<T>, ctx?: OperationContext): Promise<T[]> {
    try {
      let query = `SELECT * FROM ${this.schemaName}.${this.tableName}`;
      const values: any[] = [];
      let paramCount = 0;

      // Add WHERE conditions if provided
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
    } catch (error: any) {
      throw new URPCError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to find records: ${error.message}`
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

  // async create(args: CreationArgs<T>, ctx?: OperationContext): Promise<T> {
  //   const keys = Object.keys(args.data);
  //   const values = Object.values(args.data);
  //   const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  //   const query = `
  //     INSERT INTO ${this.schemaName}.${this.tableName} (${keys.join(", ")})
  //     VALUES (${placeholders})
  //     RETURNING *
  //   `;

  //   const result = await this.client.query(query, values);
  //   return result.rows[0];
  // }

  // async createMany(
  //   args: CreateManyArgs<T>,
  //   ctx?: OperationContext
  // ): Promise<T[]> {
  //   if (!args.data || args.data.length === 0) {
  //     return [];
  //   }

  //   const keys = Object.keys(args.data[0]);
  //   const valueRows: string[] = [];
  //   const allValues: any[] = [];
  //   let paramCount = 0;

  //   for (const item of args.data) {
  //     const itemValues = keys.map((key) => item[key]);
  //     const placeholders = itemValues.map(() => `$${++paramCount}`).join(", ");
  //     valueRows.push(`(${placeholders})`);
  //     allValues.push(...itemValues);
  //   }

  //   const query = `
  //     INSERT INTO ${this.schemaName}.${this.tableName} (${keys.join(", ")})
  //     VALUES ${valueRows.join(", ")}
  //     RETURNING *
  //   `;

  //   const result = await this.client.query(query, allValues);
  //   return result.rows;
  // }

  // async update(args: UpdateArgs<T>, ctx?: OperationContext): Promise<T> {
  //   const updateKeys = Object.keys(args.data);
  //   const updateValues = Object.values(args.data);
  //   const updateClauses = updateKeys.map(
  //     (key, index) => `${key} = $${index + 1}`
  //   );

  //   const whereConditions: string[] = [];
  //   const whereValues: any[] = [];
  //   let paramCount = updateKeys.length;

  //   for (const [key, value] of Object.entries(args.where)) {
  //     if (typeof value === "object" && value !== null) {
  //       if (value.$eq !== undefined) {
  //         whereConditions.push(`${key} = $${++paramCount}`);
  //         whereValues.push(value.$eq);
  //       }
  //     } else {
  //       whereConditions.push(`${key} = $${++paramCount}`);
  //       whereValues.push(value);
  //     }
  //   }

  //   const query = `
  //     UPDATE ${this.schemaName}.${this.tableName}
  //     SET ${updateClauses.join(", ")}
  //     WHERE ${whereConditions.join(" AND ")}
  //     RETURNING *
  //   `;

  //   const allValues = [...updateValues, ...whereValues];
  //   const result = await this.client.query(query, allValues);
  //   return result.rows[0];
  // }

  // async updateMany(
  //   args: UpdateManyArgs<T>,
  //   ctx?: OperationContext
  // ): Promise<T[]> {
  //   const updateKeys = Object.keys(args.data);
  //   const updateValues = Object.values(args.data);
  //   const updateClauses = updateKeys.map(
  //     (key, index) => `${key} = $${index + 1}`
  //   );

  //   const whereConditions: string[] = [];
  //   const whereValues: any[] = [];
  //   let paramCount = updateKeys.length;

  //   for (const [key, value] of Object.entries(args.where)) {
  //     if (typeof value === "object" && value !== null) {
  //       if (value.$eq !== undefined) {
  //         whereConditions.push(`${key} = $${++paramCount}`);
  //         whereValues.push(value.$eq);
  //       }
  //     } else {
  //       whereConditions.push(`${key} = $${++paramCount}`);
  //       whereValues.push(value);
  //     }
  //   }

  //   const query = `
  //     UPDATE ${this.schemaName}.${this.tableName}
  //     SET ${updateClauses.join(", ")}
  //     WHERE ${whereConditions.join(" AND ")}
  //     RETURNING *
  //   `;

  //   const allValues = [...updateValues, ...whereValues];
  //   const result = await this.client.query(query, allValues);
  //   return result.rows;
  // }

  // async upsert(args: UpsertArgs<T>, ctx?: OperationContext): Promise<T> {
  //   // Try to find existing record
  //   const existing = await this.findOne({ where: args.where }, ctx);

  //   if (existing) {
  //     // Update existing record
  //     return this.update({ where: args.where, data: args.update }, ctx);
  //   } else {
  //     // Create new record
  //     return this.create({ data: args.create }, ctx);
  //   }
  // }

  // async upsertMany(
  //   args: UpsertManyArgs<T>,
  //   ctx?: OperationContext
  // ): Promise<T[]> {
  //   if (!args.data || args.data.length === 0) {
  //     return [];
  //   }

  //   const keys = Object.keys(args.data[0]);
  //   const valueRows: string[] = [];
  //   const allValues: any[] = [];
  //   let paramCount = 0;

  //   for (const item of args.data) {
  //     const itemValues = keys.map((key) => item[key]);
  //     const placeholders = itemValues.map(() => `$${++paramCount}`).join(", ");
  //     valueRows.push(`(${placeholders})`);
  //     allValues.push(...itemValues);
  //   }

  //   const conflictTarget = args.onConflictDoUpdate.target as string;
  //   const updateClauses = keys
  //     .filter((key) => key !== conflictTarget)
  //     .map((key) => `${key} = EXCLUDED.${key}`)
  //     .join(", ");

  //   const query = `
  //     INSERT INTO ${this.schemaName}.${this.tableName} (${keys.join(", ")})
  //     VALUES ${valueRows.join(", ")}
  //     ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updateClauses}
  //     RETURNING *
  //   `;

  //   const result = await this.client.query(query, allValues);
  //   return result.rows;
  // }

  // async delete(
  //   args: DeletionArgs<T>,
  //   ctx?: OperationContext
  // ): Promise<boolean> {
  //   const conditions: string[] = [];
  //   const values: any[] = [];
  //   let paramCount = 0;

  //   for (const [key, value] of Object.entries(args.where)) {
  //     if (typeof value === "object" && value !== null) {
  //       if (value.$eq !== undefined) {
  //         conditions.push(`${key} = $${++paramCount}`);
  //         values.push(value.$eq);
  //       }
  //     } else {
  //       conditions.push(`${key} = $${++paramCount}`);
  //       values.push(value);
  //     }
  //   }

  //   const query = `DELETE FROM ${this.schemaName}.${
  //     this.tableName
  //   } WHERE ${conditions.join(" AND ")}`;
  //   const result = await this.client.query(query, values);

  //   return result.rowCount !== null && result.rowCount > 0;
  // }
}
