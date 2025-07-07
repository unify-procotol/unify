import { BaseAdapter, FindManyArgs, FindOneArgs } from "@unilab/core";
import { SchemaEntity } from "../entities/schema";
import { Unify } from "@unilab/unify-hono";

export class SchemaAdapter extends BaseAdapter<SchemaEntity> {
  static readonly adapterName = "SchemaAdapter";

  private getSourcesForEntity(entity: string): string[] {
    const entitySources = Unify.getEntitySources();
    return entitySources[entity] || [];
  }

  async findMany(args?: FindManyArgs<SchemaEntity>): Promise<SchemaEntity[]> {
    const where = args?.where || {};
    const schemas = Unify.getEntitySchemas();
    const entity = where.name;

    if (entity) {
      const actualEntityName =
        typeof entity === "string" ? entity : entity.$eq;
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

  async findOne(args: FindOneArgs<SchemaEntity>): Promise<SchemaEntity | null> {
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
}
