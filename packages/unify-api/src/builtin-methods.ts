import { Storage } from "./storage/interface";
import { QueryArgs, EntityMethod, EntityConfig } from "./types";

export class BuiltinMethods {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * 为实体生成内置CRUD方法
   */
  generateBuiltinMethods(
    sourceId: string,
    entityName: string,
    entityConfig: EntityConfig
  ): Record<string, EntityMethod<any>> {
    const methods: Record<string, EntityMethod<any>> = {};

    // 只有在配置了 table 时才生成内置方法
    if (!entityConfig.table) {
      return methods;
    }

    const tableName = entityConfig.table?.name || entityName;

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
  ): EntityMethod<QueryArgs> {
    return async (args?: QueryArgs) => {
      return await this.storage.findMany(sourceId, tableName, args);
    };
  }

  /**
   * 创建findOne方法
   */
  private createFindOneMethod(
    sourceId: string,
    tableName: string
  ): EntityMethod<QueryArgs> {
    return async (args?: QueryArgs) => {
      const id = args?.id;
      if (!id) {
        throw { status: 400, message: "ID is required" };
      }

      const record = await this.storage.findOne(sourceId, tableName, id);
      if (!record) {
        throw { status: 404, message: `Record with id ${id} not found` };
      }

      return record;
    };
  }

  /**
   * 获取系统字段列表（自动管理的字段）
   */
  private getSystemFields(entityConfig: EntityConfig): string[] {
    const systemFields: string[] = [];

    if (!entityConfig.table?.columns) {
      return [];
    }

    Object.entries(entityConfig.table.columns).forEach(
      ([fieldName, fieldConfig]) => {
        if (
          typeof fieldConfig.default === "string" &&
          [
            "CURRENT_TIMESTAMP",
            "CURRENT_DATE",
            "CURRENT_TIME",
            "LOCALTIMESTAMP",
            "LOCALTIME",
            "UUID()",
            "AUTO_INCREMENT",
            "SERIAL",
            "NOW()",
          ].includes(fieldConfig.default)
        ) {
          systemFields.push(fieldName);
        }
      }
    );

    return systemFields;
  }

  /**
   * 过滤系统字段
   */
  private filterSystemFields(
    data: Record<string, any>,
    entityConfig: EntityConfig,
    includeId: boolean = false
  ): Record<string, any> {
    const systemFields = this.getSystemFields(entityConfig);
    const filteredData = { ...data };

    systemFields.forEach((field) => {
      // 如果includeId为true且当前字段是id，则保留
      if (includeId && field === "id") {
        return;
      }
      delete filteredData[field];
    });

    return filteredData;
  }

  /**
   * 创建create方法
   */
  private createCreateMethod(
    sourceId: string,
    tableName: string,
    entityConfig: EntityConfig
  ): EntityMethod<QueryArgs> {
    return async (args?: QueryArgs) => {
      if (!args) {
        throw { status: 400, message: "Request body is required" };
      }

      delete args.sourceId;

      // 验证必填字段
      if (entityConfig.table?.columns) {
        this.validateRequiredFields(
          args,
          entityConfig.table.columns,
          "create",
          entityConfig
        );
      }

      // 过滤掉系统字段
      const recordData = this.filterSystemFields(args, entityConfig);

      return await this.storage.create(sourceId, tableName, recordData);
    };
  }

  /**
   * 创建update方法
   */
  private createUpdateMethod(
    sourceId: string,
    tableName: string,
    entityConfig: EntityConfig
  ): EntityMethod<QueryArgs> {
    return async (args?: QueryArgs) => {
      const id = args?.id;
      if (!id) {
        throw { status: 400, message: "ID is required" };
      }

      if (!args) {
        throw { status: 400, message: "Request body is required" };
      }

      delete args.sourceId;

      // 过滤掉系统字段（但保留ID用于查询，然后从更新数据中移除）
      const updateData = this.filterSystemFields(args, entityConfig);
      // 确保ID不在更新数据中
      delete updateData.id;

      if (Object.keys(updateData).length === 0) {
        throw { status: 400, message: "No fields to update" };
      }

      const updatedRecord = await this.storage.update(
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
  ): EntityMethod<QueryArgs> {
    return async (args?: QueryArgs) => {
      const id = args?.id;
      if (!id) {
        throw { status: 400, message: "ID is required" };
      }

      const deleted = await this.storage.delete(sourceId, tableName, id);
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
    operation: "create" | "update",
    entityConfig: EntityConfig
  ): void {
    const errors: string[] = [];
    const systemFields = this.getSystemFields(entityConfig);

    Object.entries(columns).forEach(([fieldName, fieldConfig]) => {
      // 跳过系统字段
      if (systemFields.includes(fieldName)) {
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
  async initializeTable(
    sourceId: string,
    entityName: string,
    entityConfig: EntityConfig
  ): Promise<void> {
    if (!entityConfig.table) {
      return;
    }

    const tableName = entityConfig.table.name || entityName;

    const exists = await this.storage.tableExists(sourceId, tableName);
    if (!exists) {
      console.error(`Table ${sourceId}.${tableName} not exists`);
    }
  }
}
