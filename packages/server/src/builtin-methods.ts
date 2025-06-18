import {
  EntityFunction,
  EntityConfig,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  CreateArgs,
  DeleteArgs,
  Storage,
  TableSchema,
} from "@unify/core";

export class BuiltinMethods {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  generateBuiltinMethods(
    sourceId: string,
    entityName: string,
    entityConfig: EntityConfig
  ): Record<string, EntityFunction<any>> {
    const methods: Record<string, EntityFunction<any>> = {};

    if (!entityConfig.table) {
      return methods;
    }

    if (!entityConfig.findMany) {
      methods.findMany = this.createFindManyMethod({
        sourceId,
        entityName,
        tableSchema: entityConfig.table,
      });
    }

    if (!entityConfig.findOne) {
      methods.findOne = this.createFindOneMethod({
        sourceId,
        entityName,
        tableSchema: entityConfig.table,
      });
    }

    if (!entityConfig.create) {
      methods.create = this.createCreateMethod({
        sourceId,
        entityName,
        tableSchema: entityConfig.table,
      });
    }

    if (!entityConfig.update) {
      methods.update = this.createUpdateMethod({
        sourceId,
        entityName,
        tableSchema: entityConfig.table,
      });
    }

    if (!entityConfig.delete) {
      methods.delete = this.createDeleteMethod({
        sourceId,
        entityName,
        tableSchema: entityConfig.table,
      });
    }

    return methods;
  }

  private createFindManyMethod({
    sourceId,
    entityName,
    tableSchema,
  }: {
    sourceId: string;
    entityName: string;
    tableSchema: TableSchema;
  }): EntityFunction<FindManyArgs> {
    return async (args?: FindManyArgs) => {
      return await this.storage.findMany({
        sourceId: sourceId,
        schema: tableSchema.schema,
        tableName: tableSchema.name || entityName,
        args,
      });
    };
  }

  private createFindOneMethod({
    sourceId,
    entityName,
    tableSchema,
  }: {
    sourceId: string;
    entityName: string;
    tableSchema: TableSchema;
  }): EntityFunction<FindOneArgs> {
    return async (args?: FindOneArgs) => {
      if (!args || !("where" in args) || !args.where) {
        throw { status: 400, message: "Where condition is required" };
      }
      return await this.storage.findOne({
        sourceId: sourceId,
        schema: tableSchema.schema,
        tableName: tableSchema.name || entityName,
        args,
      });
    };
  }

  private createCreateMethod({
    sourceId,
    entityName,
    tableSchema,
  }: {
    sourceId: string;
    entityName: string;
    tableSchema: TableSchema;
  }): EntityFunction<CreateArgs> {
    return async (args?: CreateArgs) => {
      if (!args || !("data" in args) || !args.data) {
        throw { status: 400, message: "Data is required" };
      }
      return await this.storage.create({
        sourceId,
        tableSchema,
        args,
        schema: tableSchema.schema,
        tableName: tableSchema.name || entityName,
      });
    };
  }

  private createUpdateMethod({
    sourceId,
    entityName,
    tableSchema,
  }: {
    sourceId: string;
    entityName: string;
    tableSchema: TableSchema;
  }): EntityFunction<UpdateArgs> {
    return async (args?: UpdateArgs) => {
      if (!args || !("where" in args) || !args.where) {
        throw { status: 400, message: "Where condition is required" };
      }
      if (!("data" in args) || !args.data) {
        throw { status: 400, message: "Data is required" };
      }
      return await this.storage.update({
        sourceId,
        args,
        tableSchema,
        schema: tableSchema.schema,
        tableName: tableSchema.name || entityName,
      });
    };
  }

  private createDeleteMethod({
    sourceId,
    entityName,
    tableSchema,
  }: {
    sourceId: string;
    entityName: string;
    tableSchema: TableSchema;
  }): EntityFunction<DeleteArgs> {
    return async (args?: DeleteArgs) => {
      if (!args || !("where" in args) || !args.where) {
        throw { status: 400, message: "Where condition is required" };
      }
      return await this.storage.delete({
        sourceId,
        args,
        schema: tableSchema.schema,
        tableName: tableSchema.name || entityName,
      });
    };
  }
}
