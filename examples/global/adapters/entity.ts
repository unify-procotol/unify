import {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "@unilab/core";
import { Entity } from "../entities/entity";
import { Unify } from "@unilab/server";

export class EntityAdapter implements DataSourceAdapter<Entity> {
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
              schema: schema,
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
      };
    });
  }

  async findOne(args: FindOneArgs<Entity>): Promise<Entity | null> {
    const where = args.where;
    const schemas = Unify.getEntitySchemas();
    const entityName = where.name;
    if (entityName) {
      const actualEntityName =
        typeof entityName === "string" ? entityName : entityName.$eq;
      if (actualEntityName && schemas[actualEntityName]) {
        return {
          name: actualEntityName,
          schema: schemas[actualEntityName],
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

  async delete(args: DeletionArgs<Entity>): Promise<boolean> {
    throw new Error("Not implemented");
  }
}
