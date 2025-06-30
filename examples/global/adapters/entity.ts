import {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  UpsertArgs,
} from "@unilab/core";
import { Entity } from "../entities/entity";
import { Unify } from "@unilab/unify-hono";

export class EntityAdapter implements DataSourceAdapter<Entity> {
  static readonly adapterName = "EntityAdapter";

  private getSourcesForEntity(entityName: string): string[] {
    const entitySources = Unify.getEntitySources();
    return entitySources[entityName] || [];
  }

  async findMany(args?: FindManyArgs<Entity>): Promise<Entity[]> {
    const where = args?.where || {};
    const schemas = Unify.getEntitySchemas();
    const entityName = where.name;

    if (entityName) {
      const actualEntityName =
        typeof entityName === "string" ? entityName : entityName.$eq;
      if (actualEntityName) {
        const schema = schemas[actualEntityName];
        if (schema) {
          return [
            {
              name: actualEntityName,
              schema: schemas[actualEntityName],
              sources: this.getSourcesForEntity(actualEntityName),
            },
          ];
        } else {
          return [];
        }
      }
    }

    return Object.keys(schemas).map((name) => {
      return {
        name,
        schema: schemas[name],
        sources: this.getSourcesForEntity(name),
      };
    });
  }

  async findOne(args: FindOneArgs<Entity>): Promise<Entity | null> {
    const where = args.where;
    const schemas = Unify.getEntitySchemas();
    const entityName = where.name;
    if (entityName) {
      if (entityName && schemas[entityName]) {
        return {
          name: entityName,
          schema: schemas[entityName],
          sources: this.getSourcesForEntity(entityName),
        };
      }
    }
    return null;
  }

  async create(args: CreationArgs<Entity>): Promise<Entity> {
    throw new Error("Not implemented");
  }

  async update(args: UpdateArgs<Entity>): Promise<Entity> {
    throw new Error("Not implemented");
  }

  async upsert(args: UpsertArgs<Entity>): Promise<Entity> {
    throw new Error("Not implemented");
  }

  async delete(args: DeletionArgs<Entity>): Promise<boolean> {
    throw new Error("Not implemented");
  }
}
