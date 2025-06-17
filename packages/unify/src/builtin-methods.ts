import { Storage } from "./storage/interface";
import {
  EntityFunction,
  EntityConfig,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  CreateArgs,
  DeleteArgs,
} from "./types";

export class BuiltinMethods {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  generateBuiltinMethods(
    source_id: string,
    entityName: string,
    entityConfig: EntityConfig
  ): Record<string, EntityFunction<any>> {
    const methods: Record<string, EntityFunction<any>> = {};

    if (!entityConfig.table) {
      return methods;
    }

    const tableName = entityConfig.table?.name || entityName;

    if (!entityConfig.findMany) {
      methods.findMany = this.createFindManyMethod(source_id, tableName);
    }

    if (!entityConfig.findOne) {
      methods.findOne = this.createFindOneMethod(source_id, tableName);
    }

    if (!entityConfig.create) {
      methods.create = this.createCreateMethod(
        source_id,
        tableName,
        entityConfig
      );
    }

    if (!entityConfig.update) {
      methods.update = this.createUpdateMethod(
        source_id,
        tableName,
        entityConfig
      );
    }

    if (!entityConfig.delete) {
      methods.delete = this.createDeleteMethod(source_id, tableName);
    }

    return methods;
  }

  private createFindManyMethod(
    source_id: string,
    tableName: string
  ): EntityFunction<FindManyArgs> {
    return async (args?: FindManyArgs) => {
      return await this.storage.findMany(source_id, tableName, args);
    };
  }

  private createFindOneMethod(
    source_id: string,
    tableName: string
  ): EntityFunction<FindOneArgs> {
    return async (args?: FindOneArgs) => {
      if (!args || !("where" in args) || !args.where) {
        throw { status: 400, message: "Where condition is required" };
      }

      const record = await this.storage.findOne(source_id, tableName, {
        source_id,
        where: args.where,
        select: "select" in args ? args.select : undefined,
      });
      if (!record) {
        throw { status: 404, message: "Record not found" };
      }

      return record;
    };
  }

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

  private filterSystemFields(
    data: Record<string, any>,
    entityConfig: EntityConfig
  ): Record<string, any> {
    const systemFields = this.getSystemFields(entityConfig);
    const filteredData = { ...data };
    systemFields.forEach((field) => {
      delete filteredData[field];
    });
    return filteredData;
  }

  private createCreateMethod(
    source_id: string,
    tableName: string,
    entityConfig: EntityConfig
  ): EntityFunction<CreateArgs> {
    return async (args?: CreateArgs) => {
      if (!args || !("data" in args) || !args.data) {
        throw { status: 400, message: "Data is required" };
      }

      if (entityConfig.table?.columns) {
        this.validateRequiredFields(
          args.data,
          entityConfig.table.columns,
          "create",
          entityConfig
        );
      }

      const recordData = this.filterSystemFields(args.data, entityConfig);

      return await this.storage.create(source_id, tableName, {
        source_id,
        data: recordData,
      });
    };
  }

  private createUpdateMethod(
    sourceId: string,
    tableName: string,
    entityConfig: EntityConfig
  ): EntityFunction<UpdateArgs> {
    return async (args?: UpdateArgs) => {
      if (!args || !("where" in args) || !args.where) {
        throw { status: 400, message: "Where condition is required" };
      }

      if (!("data" in args) || !args.data) {
        throw { status: 400, message: "Data is required" };
      }

      const updateData = this.filterSystemFields(args.data, entityConfig);
      if (Object.keys(updateData).length === 0) {
        throw { status: 400, message: "No fields to update" };
      }

      const updatedRecord = await this.storage.update(sourceId, tableName, {
        source_id: sourceId,
        where: args.where,
        data: updateData,
      });
      if (!updatedRecord) {
        throw { status: 404, message: "Record not found" };
      }

      return updatedRecord;
    };
  }

  private createDeleteMethod(
    sourceId: string,
    tableName: string
  ): EntityFunction<DeleteArgs> {
    return async (args?: DeleteArgs) => {
      if (!args || !("where" in args) || !args.where) {
        throw { status: 400, message: "Where condition is required" };
      }
      const deleted = await this.storage.delete(sourceId, tableName, {
        source_id: sourceId,
        where: args.where,
      });
      if (!deleted) {
        throw { status: 404, message: "Record not found" };
      }
      return {
        success: true,
        message: "Record deleted successfully",
      };
    };
  }

  private validateRequiredFields(
    data: Record<string, any>,
    columns: Record<string, any>,
    operation: "create" | "update",
    entityConfig: EntityConfig
  ): void {
    const errors: string[] = [];
    const systemFields = this.getSystemFields(entityConfig);

    Object.entries(columns).forEach(([fieldName, fieldConfig]) => {
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

  async initializeTable(
    source_id: string,
    entityName: string,
    entityConfig: EntityConfig
  ): Promise<void> {
    if (!entityConfig.table) {
      return;
    }

    const tableName = entityConfig.table.name || entityName;

    const exists = await this.storage.tableExists(source_id, tableName);
    if (!exists) {
      console.error(`Table ${source_id}.${tableName} not exists`);
    }
  }
}
