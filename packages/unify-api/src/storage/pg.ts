import { Pool, PoolConfig, QueryResult } from "pg";
import { Storage } from "./interface";
import {
  CreateArgs,
  FindOneArgs,
  UpdateArgs,
  DeleteArgs,
  QueryArgs,
} from "../types";

export interface PGStorageConfig extends PoolConfig {}

export class PGStorage implements Storage {
  private pool: Pool;

  constructor(config: PGStorageConfig) {
    this.pool = new Pool(config);
  }

  /**
   * 获取完整表名（包含sourceId前缀）
   */
  private getFullTableName(sourceId: string, tableName: string): string {
    return `${sourceId}_${tableName}`;
  }

  /**
   * 构建WHERE子句
   */
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

  /**
   * 构建ORDER BY子句
   */
  private buildOrderByClause(orderBy: Record<string, "asc" | "desc">): string {
    const orders = Object.entries(orderBy).map(
      ([field, direction]) => `${field} ${direction.toUpperCase()}`
    );
    return orders.length > 0 ? `ORDER BY ${orders.join(", ")}` : "";
  }

  /**
   * 创建记录
   */
  async create(
    sourceId: string,
    tableName: string,
    args: CreateArgs
  ): Promise<Record<string, any>> {
    const fullTableName = this.getFullTableName(sourceId, tableName);
    const client = await this.pool.connect();

    try {
      const keys = Object.keys(args.data);
      const values = Object.values(args.data);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

      const query = `
        INSERT INTO ${fullTableName} (${keys.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result: QueryResult = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * 查找多条记录
   */
  async findMany(
    sourceId: string,
    tableName: string,
    args?: QueryArgs
  ): Promise<Record<string, any>[]> {
    const fullTableName = this.getFullTableName(sourceId, tableName);
    const client = await this.pool.connect();

    try {
      let query = `SELECT `;

      // 字段选择
      if (args && "select" in args && args.select && args.select.length > 0) {
        query += args.select.join(", ");
      } else {
        query += "*";
      }

      query += ` FROM ${fullTableName}`;

      const queryValues: any[] = [];
      let paramIndex = 1;

      // WHERE条件
      if (args && "where" in args && args.where) {
        const whereClause = this.buildWhereClause(args.where, paramIndex);
        query += ` ${whereClause.clause}`;
        queryValues.push(...whereClause.values);
        paramIndex += whereClause.values.length;
      }

      // ORDER BY
      if (args && "order_by" in args && args.order_by) {
        query += ` ${this.buildOrderByClause(args.order_by)}`;
      }

      // LIMIT
      if (args && "limit" in args && args.limit) {
        query += ` LIMIT $${paramIndex}`;
        queryValues.push(args.limit);
        paramIndex++;
      }

      // OFFSET
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

  /**
   * 查找单条记录
   */
  async findOne(
    sourceId: string,
    tableName: string,
    args: FindOneArgs
  ): Promise<Record<string, any> | null> {
    const fullTableName = this.getFullTableName(sourceId, tableName);
    const client = await this.pool.connect();

    try {
      let query = `SELECT `;

      // 字段选择
      if (args.select && args.select.length > 0) {
        query += args.select.join(", ");
      } else {
        query += "*";
      }

      query += ` FROM ${fullTableName}`;

      const queryValues: any[] = [];

      // WHERE条件
      const whereClause = this.buildWhereClause(args.where, 1);
      query += ` ${whereClause.clause}`;
      queryValues.push(...whereClause.values);

      // 限制返回一条记录
      query += ` LIMIT 1`;

      const result: QueryResult = await client.query(query, queryValues);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  /**
   * 更新记录
   */
  async update(
    sourceId: string,
    tableName: string,
    args: UpdateArgs
  ): Promise<Record<string, any> | null> {
    const fullTableName = this.getFullTableName(sourceId, tableName);
    const client = await this.pool.connect();

    try {
      const keys = Object.keys(args.data);
      const values = Object.values(args.data);
      const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

      // 构建WHERE子句
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
    } finally {
      client.release();
    }
  }

  /**
   * 删除记录
   */
  async delete(
    sourceId: string,
    tableName: string,
    args: DeleteArgs
  ): Promise<boolean> {
    const fullTableName = this.getFullTableName(sourceId, tableName);
    const client = await this.pool.connect();

    try {
      // 构建WHERE子句
      const whereClause = this.buildWhereClause(args.where, 1);

      const query = `DELETE FROM ${fullTableName} ${whereClause.clause}`;
      const result: QueryResult = await client.query(query, whereClause.values);
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * 清空表
   */
  async truncate(sourceId: string, tableName: string): Promise<void> {
    const fullTableName = this.getFullTableName(sourceId, tableName);
    const client = await this.pool.connect();

    try {
      const query = `TRUNCATE TABLE ${fullTableName} RESTART IDENTITY`;
      await client.query(query);
    } finally {
      client.release();
    }
  }

  /**
   * 检查表是否存在
   */
  async tableExists(sourceId: string, tableName: string): Promise<boolean> {
    const fullTableName = this.getFullTableName(sourceId, tableName);
    const client = await this.pool.connect();

    try {
      const query = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `;
      const result: QueryResult = await client.query(query, [fullTableName]);
      return result.rows[0].exists;
    } finally {
      client.release();
    }
  }

  /**
   * 创建表（辅助方法）
   */
  async createTable(
    sourceId: string,
    tableName: string,
    columns: Record<
      string,
      { type: string; nullable?: boolean; unique?: boolean; default?: any }
    >
  ): Promise<void> {
    const fullTableName = this.getFullTableName(sourceId, tableName);
    const client = await this.pool.connect();

    try {
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
            // 处理PostgreSQL特殊函数，不需要引号
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
        CREATE TABLE IF NOT EXISTS ${fullTableName} (
          ${columnDefinitions.join(",\n          ")}
        )
      `;

      await client.query(query);
    } finally {
      client.release();
    }
  }

  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
