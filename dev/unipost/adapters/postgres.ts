import {
  BaseAdapter,
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  URPCError,
  ErrorCodes,
  OrderByValue,
} from "@unilab/urpc-core";
import postgres from "postgres";

export interface PostgresAdapterConfig {
  tableName: string;
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  max?: number;
  idle_timeout?: number;
  connect_timeout?: number;
}

export class PostgresAdapter<
  T extends Record<string, any>
> extends BaseAdapter<T> {
  private sql: postgres.Sql;
  private tableName: string;

  constructor(config: PostgresAdapterConfig) {
    super();

    this.tableName = config.tableName;

    const connectionString =
      config.connectionString || process.env.DATABASE_URL;

    if (connectionString) {
      this.sql = postgres(connectionString, {
        max:
          config.max || parseInt(process.env.POSTGRES_MAX_CONNECTIONS || "20"),
        idle_timeout:
          config.idle_timeout ||
          parseInt(process.env.POSTGRES_IDLE_TIMEOUT || "20"),
        connect_timeout:
          config.connect_timeout ||
          parseInt(process.env.POSTGRES_CONNECT_TIMEOUT || "10"),
      });
    } else {
      const host = config.host || process.env.POSTGRES_HOST;
      const port = config.port || parseInt(process.env.POSTGRES_PORT || "5432");
      const database = config.database || process.env.POSTGRES_DB;
      const username = config.username || process.env.POSTGRES_USER;
      const password = config.password || process.env.POSTGRES_PASSWORD;

      if (!host || !database || !username) {
        throw new URPCError(
          ErrorCodes.BAD_REQUEST,
          "PostgreSQL connection configuration missing. Please set DATABASE_URL or provide host, database, and username via environment variables (POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER) or config."
        );
      }

      this.sql = postgres({
        host,
        port,
        database,
        username,
        password: password || "",
        ssl: config.ssl ?? process.env.POSTGRES_SSL === "true",
        max:
          config.max || parseInt(process.env.POSTGRES_MAX_CONNECTIONS || "20"),
        idle_timeout:
          config.idle_timeout ||
          parseInt(process.env.POSTGRES_IDLE_TIMEOUT || "20"),
        connect_timeout:
          config.connect_timeout ||
          parseInt(process.env.POSTGRES_CONNECT_TIMEOUT || "10"),
      });
    }
  }

  private buildWhereClause(where: any): { whereClause: string; values: any[] } {
    if (!where || Object.keys(where).length === 0) {
      return { whereClause: "", values: [] };
    }

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(where)) {
      if (value === null || value === undefined) {
        continue;
      }

      if (typeof value === "object" && value !== null) {
        // Handle query operators
        const operators = value as any;
        if (operators.eq !== undefined) {
          conditions.push(`${key} = $${paramIndex}`);
          values.push(operators.eq);
          paramIndex++;
        } else if (operators.ne !== undefined) {
          conditions.push(`${key} != $${paramIndex}`);
          values.push(operators.ne);
          paramIndex++;
        } else if (operators.gt !== undefined) {
          conditions.push(`${key} > $${paramIndex}`);
          values.push(operators.gt);
          paramIndex++;
        } else if (operators.gte !== undefined) {
          conditions.push(`${key} >= $${paramIndex}`);
          values.push(operators.gte);
          paramIndex++;
        } else if (operators.lt !== undefined) {
          conditions.push(`${key} < $${paramIndex}`);
          values.push(operators.lt);
          paramIndex++;
        } else if (operators.lte !== undefined) {
          conditions.push(`${key} <= $${paramIndex}`);
          values.push(operators.lte);
          paramIndex++;
        } else if (operators.in !== undefined && Array.isArray(operators.in)) {
          const placeholders = operators.in
            .map(() => `$${paramIndex++}`)
            .join(", ");
          conditions.push(`${key} IN (${placeholders})`);
          values.push(...operators.in);
        } else if (
          operators.nin !== undefined &&
          Array.isArray(operators.nin)
        ) {
          const placeholders = operators.nin
            .map(() => `$${paramIndex++}`)
            .join(", ");
          conditions.push(`${key} NOT IN (${placeholders})`);
          values.push(...operators.nin);
        }
      } else {
        // Direct value comparison
        conditions.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return { whereClause, values };
  }

  private buildOrderByClause(
    orderBy?: Partial<Record<keyof T, OrderByValue>>
  ): string {
    if (!orderBy || Object.keys(orderBy).length === 0) {
      return "";
    }

    const orderClauses = Object.entries(orderBy).map(([key, direction]) => {
      if (typeof direction === "string") {
        return `${key} ${direction?.toUpperCase() || "ASC"}`;
      } else if (
        typeof direction === "object" &&
        direction.path &&
        direction.sortOrder
      ) {
        return `(${direction.path
          .map((p) => `"${p}"`)
          .join(",")}) ${direction.sortOrder.toUpperCase()}`;
      }
      return "";
    });

    return `ORDER BY ${orderClauses.join(", ")}`;
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    try {
      const { whereClause, values } = this.buildWhereClause(args?.where);
      const orderByClause = this.buildOrderByClause(args?.order_by);

      let query = `SELECT * FROM ${this.tableName}`;

      if (whereClause) {
        query += ` ${whereClause}`;
      }

      if (orderByClause) {
        query += ` ${orderByClause}`;
      }

      if (args?.limit) {
        query += ` LIMIT ${args.limit}`;
      }

      if (args?.offset) {
        query += ` OFFSET ${args.offset}`;
      }

      const result = await this.sql.unsafe(query, values as any[]);
      return result.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new URPCError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to find records: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    try {
      const { whereClause, values } = this.buildWhereClause(args.where);

      if (!whereClause) {
        throw new URPCError(
          ErrorCodes.BAD_REQUEST,
          "Where clause is required for findOne"
        );
      }

      const query = `SELECT * FROM ${this.tableName} ${whereClause} LIMIT 1`;
      const result = await this.sql.unsafe(query, values as any[]);

      if (result.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result[0]);
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

  async create(args: CreationArgs<T>): Promise<T> {
    try {
      const data = { ...args.data };

      // Set timestamps if the entity has these fields
      const now = new Date().toISOString();
      if ("created_at" in data || !data.created_at) {
        (data as any).created_at = now;
      }
      if ("updated_at" in data || !data.updated_at) {
        (data as any).updated_at = now;
      }

      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.sql.unsafe(query, values as any[]);

      if (result.length === 0) {
        throw new URPCError(
          ErrorCodes.INTERNAL_SERVER_ERROR,
          "Failed to create record"
        );
      }

      return this.mapRowToEntity(result[0]);
    } catch (error) {
      if (error instanceof URPCError) {
        throw error;
      }
      throw new URPCError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to create record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    try {
      const { whereClause, values: whereValues } = this.buildWhereClause(
        args.where
      );

      if (!whereClause) {
        throw new URPCError(
          ErrorCodes.BAD_REQUEST,
          "Where clause is required for update"
        );
      }

      const updateData = { ...args.data };
      // Set updated timestamp if the entity has this field
      if ("updated_at" in updateData || updateData.updated_at !== undefined) {
        (updateData as any).updated_at = new Date().toISOString();
      }

      const updateFields = Object.keys(updateData);
      const updateValues = Object.values(updateData);

      const setClause = updateFields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

      const allValues = [...updateValues, ...whereValues];
      const adjustedWhereClause = whereClause.replace(
        /\$(\d+)/g,
        (_, num) => `$${parseInt(num) + updateValues.length}`
      );

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}
        ${adjustedWhereClause}
        RETURNING *
      `;

      const result = await this.sql.unsafe(query, allValues as any[]);

      if (result.length === 0) {
        throw new URPCError(ErrorCodes.NOT_FOUND, "Record not found");
      }

      return this.mapRowToEntity(result[0]);
    } catch (error) {
      if (error instanceof URPCError) {
        throw error;
      }
      throw new URPCError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to update record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async delete(args: DeletionArgs<T>): Promise<boolean> {
    try {
      const { whereClause, values } = this.buildWhereClause(args.where);

      if (!whereClause) {
        throw new URPCError(
          ErrorCodes.BAD_REQUEST,
          "Where clause is required for delete"
        );
      }

      const query = `DELETE FROM ${this.tableName} ${whereClause}`;
      const result = await this.sql.unsafe(query, values as any[]);

      return result.count > 0;
    } catch (error) {
      if (error instanceof URPCError) {
        throw error;
      }
      throw new URPCError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to delete record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private mapRowToEntity(row: any): T {
    return row as T;
  }

  async close(): Promise<void> {
    await this.sql.end();
  }
}
