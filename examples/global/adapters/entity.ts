import {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "@unify/core";
import { Entity } from "../entities/entity";

const entities: Entity[] = [];

export class EntityAdapter implements DataSourceAdapter<Entity> {
  async findMany(args?: FindManyArgs<Entity>): Promise<Entity[]> {
    const where = args?.where || {};
    if (where.name) {
      return entities.filter((entity) => entity.name === where.name);
    }
    return entities;
  }

  async findOne(args: FindOneArgs<Entity>): Promise<Entity | null> {
    const where = args.where;
    if (where.name) {
      return entities.find((entity) => entity.name === where.name) || null;
    }
    return null;
  }

  async create(args: CreationArgs<Entity>): Promise<Entity> {
    const { name, schemas } = args.data;
    if (!name || !schemas) {
      throw {
        status: 400,
        message: "name and ast are required",
      };
    }

    entities.push({
      name,
      schemas,
    });

    return {
      name,
      schemas,
    };
  }

  async update(args: UpdateArgs<Entity>): Promise<Entity> {
    const { name, schemas } = args.data;
    if (!name || !schemas) {
      throw {
        status: 400,
        message: "name and ast are required",
      };
    }
    const entity = entities.find((entity) => entity.name === name);
    if (!entity) {
      throw {
        status: 404,
        message: "entity not found",
      };
    }
    entity.schemas = schemas;
    return entity;
  }

  async delete(args: DeletionArgs<Entity>): Promise<boolean> {
    return false;
  }
}
