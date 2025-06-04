import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { QueryArgs } from "./types";

export interface TableData {
  records: Record<string, any>[];
  autoIncrement: number;
}

export class FileStorage {
  private dataDir: string;

  constructor(dataDir: string = "./data") {
    this.dataDir = dataDir;
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private getTablePath(sourceId: string, tableName: string): string {
    return join(this.dataDir, `${sourceId}_${tableName}.json`);
  }

  private loadTable(sourceId: string, tableName: string): TableData {
    const tablePath = this.getTablePath(sourceId, tableName);

    if (!existsSync(tablePath)) {
      return { records: [], autoIncrement: 1 };
    }

    try {
      const data = readFileSync(tablePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return { records: [], autoIncrement: 1 };
    }
  }

  private saveTable(
    sourceId: string,
    tableName: string,
    data: TableData
  ): void {
    const tablePath = this.getTablePath(sourceId, tableName);
    writeFileSync(tablePath, JSON.stringify(data, null, 2));
  }

  // 创建记录
  create(
    sourceId: string,
    tableName: string,
    record: Record<string, any>
  ): Record<string, any> {
    const tableData = this.loadTable(sourceId, tableName);

    // 添加自增ID（如果没有提供id）
    if (!record.id) {
      record.id = tableData.autoIncrement++;
    }

    // 添加时间戳
    record.created_at = new Date().toISOString();
    record.updated_at = record.created_at;

    tableData.records.push(record);
    this.saveTable(sourceId, tableName, tableData);

    return record;
  }

  // 查找多条记录
  findMany(
    sourceId: string,
    tableName: string,
    args: QueryArgs = {}
  ): Record<string, any>[] {
    const tableData = this.loadTable(sourceId, tableName);
    let records = [...tableData.records];

    // 过滤条件
    if (args.where) {
      records = records.filter((record) =>
        Object.entries(args.where!).every(
          ([key, value]) => record[key] === value
        )
      );
    }

    // 排序
    if (args.order_by) {
      const [field, direction] = Object.entries(args.order_by)[0];
      records.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction === "desc") {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // 分页
    if (args.offset) {
      records = records.slice(args.offset);
    }
    if (args.limit) {
      records = records.slice(0, args.limit);
    }

    // 字段选择
    if (args.select) {
      records = records.map((record) => {
        const selected: Record<string, any> = {};
        args.select!.forEach((field) => {
          if (record.hasOwnProperty(field)) {
            selected[field] = record[field];
          }
        });
        return selected;
      });
    }

    return records;
  }

  // 查找单条记录
  findOne(
    sourceId: string,
    tableName: string,
    id: string | number
  ): Record<string, any> | null {
    const tableData = this.loadTable(sourceId, tableName);
    const record = tableData.records.find((r) => r.id == id);
    return record || null;
  }

  // 更新记录
  update(
    sourceId: string,
    tableName: string,
    id: string | number,
    updates: Record<string, any>
  ): Record<string, any> | null {
    const tableData = this.loadTable(sourceId, tableName);
    const recordIndex = tableData.records.findIndex((r) => r.id == id);

    if (recordIndex === -1) {
      return null;
    }

    // 更新记录
    const record = tableData.records[recordIndex];
    Object.assign(record, updates);
    record.updated_at = new Date().toISOString();

    this.saveTable(sourceId, tableName, tableData);
    return record;
  }

  // 删除记录
  delete(sourceId: string, tableName: string, id: string | number): boolean {
    const tableData = this.loadTable(sourceId, tableName);
    const recordIndex = tableData.records.findIndex((r) => r.id == id);

    if (recordIndex === -1) {
      return false;
    }

    tableData.records.splice(recordIndex, 1);
    this.saveTable(sourceId, tableName, tableData);
    return true;
  }

  // 清空表
  truncate(sourceId: string, tableName: string): void {
    this.saveTable(sourceId, tableName, { records: [], autoIncrement: 1 });
  }

  // 检查表是否存在
  tableExists(sourceId: string, tableName: string): boolean {
    return existsSync(this.getTablePath(sourceId, tableName));
  }
}
