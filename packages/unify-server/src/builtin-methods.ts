import { FileStorage } from "./file-storage";
import { QueryArgs, EntityMethod, EntityConfig } from "./types";

export class BuiltinMethods {
  private storage: FileStorage;

  constructor(storage: FileStorage) {
    this.storage = storage;
  }

  /**
   * 为实体生成内置CRUD方法
   */
  generateBuiltinMethods(
    sourceId: string,
    entityName: string,
    entityConfig: EntityConfig
  ): Record<string, EntityMethod> {
    const tableName = entityConfig.table?.name || entityName;
    const methods: Record<string, EntityMethod> = {};

    // 只有在用户没有定义对应方法时才添加内置方法
    if (!entityConfig.findMany) {
      methods.findMany = this.createFindManyMethod(sourceId, tableName);
    }

    if (!entityConfig.findOne) {
      methods.findOne = this.createFindOneMethod(sourceId, tableName);
    }

    if (!entityConfig.create) {
      methods.create = this.createCreateMethod(
        sourceId,
        tableName,
        entityConfig
      );
    }

    if (!entityConfig.update) {
      methods.update = this.createUpdateMethod(
        sourceId,
        tableName,
        entityConfig
      );
    }

    if (!entityConfig.delete) {
      methods.delete = this.createDeleteMethod(sourceId, tableName);
    }

    return methods;
  }

  /**
   * 创建findMany方法
   */
  private createFindManyMethod(
    sourceId: string,
    tableName: string
  ): EntityMethod {
    return async (args?: QueryArgs) => {
      return this.storage.findMany(sourceId, tableName, args);
    };
  }

  /**
   * 创建findOne方法
   */
  private createFindOneMethod(
    sourceId: string,
    tableName: string
  ): EntityMethod {
    return async (args?: QueryArgs) => {
      const id = args?.id;
      if (!id) {
        throw { status: 400, message: "ID is required" };
      }

      const record = this.storage.findOne(sourceId, tableName, id);
      if (!record) {
        throw { status: 404, message: `Record with id ${id} not found` };
      }

      return record;
    };
  }

  /**
   * 创建create方法
   */
  private createCreateMethod(
    sourceId: string,
    tableName: string,
    entityConfig: EntityConfig
  ): EntityMethod {
    return async (args?: QueryArgs) => {
      if (!args) {
        throw { status: 400, message: "Request body is required" };
      }

      // 验证必填字段
      if (entityConfig.table?.columns) {
        this.validateRequiredFields(args, entityConfig.table.columns, "create");
      }

      // 过滤掉系统字段
      const { id, created_at, updated_at, ...recordData } = args;

      return this.storage.create(sourceId, tableName, recordData);
    };
  }

  /**
   * 创建update方法
   */
  private createUpdateMethod(
    sourceId: string,
    tableName: string,
    entityConfig: EntityConfig
  ): EntityMethod {
    return async (args?: QueryArgs) => {
      const id = args?.id;
      if (!id) {
        throw { status: 400, message: "ID is required" };
      }

      if (!args) {
        throw { status: 400, message: "Request body is required" };
      }

      // 过滤掉系统字段和ID
      const { id: _, created_at, updated_at, ...updateData } = args;

      if (Object.keys(updateData).length === 0) {
        throw { status: 400, message: "No fields to update" };
      }

      const updatedRecord = this.storage.update(
        sourceId,
        tableName,
        id,
        updateData
      );
      if (!updatedRecord) {
        throw { status: 404, message: `Record with id ${id} not found` };
      }

      return updatedRecord;
    };
  }

  /**
   * 创建delete方法
   */
  private createDeleteMethod(
    sourceId: string,
    tableName: string
  ): EntityMethod {
    return async (args?: QueryArgs) => {
      const id = args?.id;
      if (!id) {
        throw { status: 400, message: "ID is required" };
      }

      const deleted = this.storage.delete(sourceId, tableName, id);
      if (!deleted) {
        throw { status: 404, message: `Record with id ${id} not found` };
      }

      return {
        success: true,
        message: `Record with id ${id} deleted successfully`,
      };
    };
  }

  /**
   * 验证必填字段
   */
  private validateRequiredFields(
    data: Record<string, any>,
    columns: Record<string, any>,
    operation: "create" | "update"
  ): void {
    const errors: string[] = [];

    Object.entries(columns).forEach(([fieldName, fieldConfig]) => {
      // 跳过系统字段
      if (["id", "created_at", "updated_at"].includes(fieldName)) {
        return;
      }

      const isRequired =
        !fieldConfig.nullable && fieldConfig.default === undefined;
      const hasValue =
        data[fieldName] !== undefined && data[fieldName] !== null;

      if (operation === "create" && isRequired && !hasValue) {
        errors.push(`Field '${fieldName}' is required`);
      }
    });

    if (errors.length > 0) {
      throw { status: 400, message: `Validation failed: ${errors.join(", ")}` };
    }
  }

  /**
   * 初始化表结构（如果配置了table schema）
   */
  initializeTable(
    sourceId: string,
    entityName: string,
    entityConfig: EntityConfig
  ): void {
    if (!entityConfig.table) {
      return;
    }

    const tableName = entityConfig.table.name || entityName;

    // 如果表不存在，创建空表
    if (!this.storage.tableExists(sourceId, tableName)) {
      // 表会在第一次操作时自动创建，这里不需要特殊处理
      console.log(
        `Table ${sourceId}.${tableName} will be created on first use`
      );
    }
  }
}
