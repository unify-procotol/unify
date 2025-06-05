import { QueryArgs } from "./types";

export interface Storage {
  /**
   * 创建记录
   */
  create(
    sourceId: string,
    tableName: string,
    record: Record<string, any>
  ): Promise<Record<string, any>>;

  /**
   * 查找多条记录
   */
  findMany(
    sourceId: string,
    tableName: string,
    args?: QueryArgs
  ): Promise<Record<string, any>[]>;

  /**
   * 查找单条记录
   */
  findOne(
    sourceId: string,
    tableName: string,
    id: string | number
  ): Promise<Record<string, any> | null>;

  /**
   * 更新记录
   */
  update(
    sourceId: string,
    tableName: string,
    id: string | number,
    updates: Record<string, any>
  ): Promise<Record<string, any> | null>;

  /**
   * 删除记录
   */
  delete(
    sourceId: string,
    tableName: string,
    id: string | number
  ): Promise<boolean>;

  /**
   * 清空表
   */
  truncate(sourceId: string, tableName: string): Promise<void>;

  /**
   * 检查表是否存在
   */
  tableExists(sourceId: string, tableName: string): Promise<boolean>;

  /**
   * 关闭连接（可选）
   */
  close?(): Promise<void>;
}
