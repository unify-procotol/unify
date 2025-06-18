import { Pool, PoolConfig, QueryResult } from "pg";
import {
  CreateArgs,
  FindOneArgs,
  UpdateArgs,
  DeleteArgs,
  QueryArgs,
  Storage,
  TableSchema,
} from "@unify/core";

export function getFullTableName({
  sourceId,
  tableName,
  schema,
}: {
  sourceId: string;
  tableName: string;
  schema?: string;
}): string {
  const fullTableName = `${sourceId}_${tableName}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
  return schema ? `${schema}.${fullTableName}` : fullTableName;
}

export class PGStorage implements Storage {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  private buildWhereClause(
    where: Record<string, any>,
    startIndex: number = 1
  ): { clause: string; values: any[] } {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = startIndex;

    for (const [key, value] of Object.entries(where)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
      values,
    };
  }

  private buildOrderByClause(
    orderBy: Partial<Record<string, "asc" | "desc">>
  ): string {
    const orders = Object.entries(orderBy)
      .filter(([_, direction]) => !!direction)
      .map(([field, direction]) => `${field} ${direction!.toUpperCase()}`);
    return orders.length > 0 ? `ORDER BY ${orders.join(", ")}` : "";
  }

  async create({
    sourceId,
    tableName,
    args,
    schema,
    tableSchema,
  }: {
    sourceId: string;
    tableName: string;
    args: CreateArgs;
    schema?: string;
    tableSchema: TableSchema;
  }): Promise<Record<string, any>> {
    const recordData = validateAndFilterFields({
      data: args.data,
      tableSchema,
      operation: "create",
    });

    const fullTableName = getFullTableName({
      sourceId,
      tableName,
      schema,
    });

    const client = await this.pool.connect();

    try {
      const keys = Object.keys(recordData);
      const values = Object.values(recordData);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
      const query = `
        INSERT INTO ${fullTableName} (${keys.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result: QueryResult = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw { status: 500, message: "Create failed" };
    } finally {
      client.release();
    }
  }

  async findMany({
    sourceId,
    tableName,
    args,
    schema,
  }: {
    sourceId: string;
    tableName: string;
    args?: QueryArgs;
    schema?: string;
  }): Promise<Record<string, any>[]> {
    const fullTableName = getFullTableName({
      sourceId,
      tableName,
      schema,
    });
    const client = await this.pool.connect();

    try {
      let query = `SELECT `;

      if (args && "select" in args && args.select && args.select.length > 0) {
        query += args.select.join(", ");
      } else {
        query += "*";
      }

      query += ` FROM ${fullTableName}`;

      const queryValues: any[] = [];
      let paramIndex = 1;

      if (args && "where" in args && args.where) {
        const whereClause = this.buildWhereClause(args.where, paramIndex);
        query += ` ${whereClause.clause}`;
        queryValues.push(...whereClause.values);
        paramIndex += whereClause.values.length;
      }

      if (args && "order_by" in args && args.order_by) {
        query += ` ${this.buildOrderByClause(args.order_by)}`;
      }

      if (args && "limit" in args && args.limit) {
        query += ` LIMIT $${paramIndex}`;
        queryValues.push(args.limit);
        paramIndex++;
      }

      if (args && "offset" in args && args.offset) {
        query += ` OFFSET $${paramIndex}`;
        queryValues.push(args.offset);
      }

      const result: QueryResult = await client.query(query, queryValues);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findOne({
    sourceId,
    tableName,
    args,
    schema,
  }: {
    sourceId: string;
    tableName: string;
    args: FindOneArgs;
    schema?: string;
  }): Promise<Record<string, any> | null> {
    const fullTableName = getFullTableName({
      sourceId,
      tableName,
      schema,
    });
    const client = await this.pool.connect();

    try {
      let query = `SELECT `;

      if (args.select && args.select.length > 0) {
        query += args.select.join(", ");
      } else {
        query += "*";
      }

      query += ` FROM ${fullTableName}`;

      const queryValues: any[] = [];

      const whereClause = this.buildWhereClause(args.where, 1);
      query += ` ${whereClause.clause}`;
      queryValues.push(...whereClause.values);

      query += ` LIMIT 1`;

      const result: QueryResult = await client.query(query, queryValues);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async update({
    sourceId,
    tableName,
    args,
    schema,
    tableSchema,
  }: {
    sourceId: string;
    tableName: string;
    args: UpdateArgs;
    schema?: string;
    tableSchema: TableSchema;
  }): Promise<Record<string, any> | null> {
    const updateData = validateAndFilterFields({
      data: args.data,
      tableSchema,
      operation: "update",
    });

    if (Object.keys(updateData).length === 0) {
      throw { status: 400, message: "No fields to update" };
    }

    const fullTableName = getFullTableName({
      sourceId,
      tableName,
      schema,
    });

    const client = await this.pool.connect();

    try {
      const keys = Object.keys(updateData);
      const values = Object.values(updateData);
      const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

      const whereClause = this.buildWhereClause(args.where, keys.length + 1);

      const query = `
        UPDATE ${fullTableName}
        SET ${setClause}
        ${whereClause.clause}
        RETURNING *
      `;
      const result: QueryResult = await client.query(query, [
        ...values,
        ...whereClause.values,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      throw { status: 500, message: "Update failed" };
    } finally {
      client.release();
    }
  }

  async delete({
    sourceId,
    tableName,
    args,
    schema,
  }: {
    sourceId: string;
    tableName: string;
    args: DeleteArgs;
    schema?: string;
  }): Promise<boolean> {
    const fullTableName = getFullTableName({
      sourceId,
      tableName,
      schema,
    });
    const client = await this.pool.connect();

    try {
      const whereClause = this.buildWhereClause(args.where, 1);
      const query = `DELETE FROM ${fullTableName} ${whereClause.clause}`;
      const result: QueryResult = await client.query(query, whereClause.values);
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  async truncate({
    sourceId,
    tableName,
    schema,
  }: {
    sourceId: string;
    tableName: string;
    schema?: string;
  }): Promise<void> {
    const fullTableName = getFullTableName({
      sourceId,
      tableName,
      schema,
    });
    const client = await this.pool.connect();

    try {
      const query = `TRUNCATE TABLE ${fullTableName} RESTART IDENTITY`;
      await client.query(query);
    } finally {
      client.release();
    }
  }

  async tableExists({
    sourceId,
    tableName,
    schema,
  }: {
    sourceId: string;
    tableName: string;
    schema?: string;
  }): Promise<boolean> {
    const fullTableName = getFullTableName({
      sourceId,
      tableName,
    });
    const client = await this.pool.connect();

    try {
      let query: string;
      let params: string[];

      if (schema) {
        query = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          )
        `;
        params = [schema, fullTableName];
      } else {
        query = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `;
        params = [fullTableName];
      }

      const result: QueryResult = await client.query(query, params);
      return result.rows[0].exists;
    } finally {
      client.release();
    }
  }

  async createTable({
    sourceId,
    schema,
    tableName,
    columns,
  }: {
    sourceId: string;
    schema?: string;
    tableName: string;
    columns: Record<
      string,
      { type: string; nullable?: boolean; unique?: boolean; default?: any }
    >;
  }): Promise<void> {
    const fullTableName = getFullTableName({
      sourceId,
      tableName,
    });
    const client = await this.pool.connect();

    try {
      // Create schema if it doesn't exist
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);

      const columnDefinitions = Object.entries(columns).map(
        ([name, config]) => {
          let definition = `${name} ${config.type}`;

          if (config.nullable === false) {
            definition += " NOT NULL";
          }

          if (config.unique) {
            definition += " UNIQUE";
          }

          if (config.default !== undefined) {
            const pgFunctions = [
              "CURRENT_TIMESTAMP",
              "NOW()",
              "CURRENT_DATE",
              "CURRENT_TIME",
              "LOCALTIMESTAMP",
              "LOCALTIME",
            ];

            const defaultValue = config.default;
            if (
              typeof defaultValue === "string" &&
              pgFunctions.includes(defaultValue.toUpperCase())
            ) {
              definition += ` DEFAULT ${defaultValue}`;
            } else if (typeof defaultValue === "string") {
              definition += ` DEFAULT '${defaultValue}'`;
            } else {
              definition += ` DEFAULT ${defaultValue}`;
            }
          }

          return definition;
        }
      );

      const query = `
        CREATE TABLE IF NOT EXISTS ${schema}.${fullTableName} (
          ${columnDefinitions.join(",\n          ")}
        )
      `;

      await client.query(query);
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

const SYSTEM_FIELD_DEFAULTS = new Set([
  "CURRENT_TIMESTAMP",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "LOCALTIMESTAMP",
  "LOCALTIME",
  "UUID()",
  "AUTO_INCREMENT",
  "SERIAL",
  "NOW()",
]);

function validateAndFilterFields({
  data,
  tableSchema,
  operation,
}: {
  data: Record<string, any>;
  tableSchema: TableSchema;
  operation: "create" | "update";
}): Record<string, any> {
  const { columns } = tableSchema;
  if (!columns) {
    throw { status: 400, message: "Table schema is not defined" };
  }

  const errors: string[] = [];
  const filteredData: Record<string, any> = {};

  for (const [fieldName, fieldConfig] of Object.entries(columns)) {
    const hasValue = data[fieldName] !== undefined && data[fieldName] !== null;

    const isSystemField =
      typeof fieldConfig.default === "string" &&
      SYSTEM_FIELD_DEFAULTS.has(fieldConfig.default);
    if (isSystemField) continue;

    if (operation === "create") {
      const isRequired =
        !fieldConfig.nullable && fieldConfig.default === undefined;
      if (isRequired && !hasValue) {
        errors.push(`Field '${fieldName}' is required`);
        continue;
      }
    }

    if (hasValue) {
      filteredData[fieldName] = data[fieldName];
    }
  }

  if (errors.length > 0) {
    throw { status: 400, message: `Validation failed: ${errors.join(", ")}` };
  }

  return filteredData;
}
