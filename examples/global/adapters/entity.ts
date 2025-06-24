import {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "@unify/core";
import { Entity } from "../entities/entity";

const entities: Entity[] = [
  {
    name: "PostEntity",
    ast: {
      kind: "ClassDeclaration",
      name: "PostEntity",
      modifiers: ["export"],
      members: [
        {
          kind: "PropertySignature",
          name: "id",
          type: {
            kind: "StringKeyword",
            typeName: "string",
          },
          optional: false,
          modifiers: [],
        },
        {
          kind: "PropertySignature",
          name: "title",
          type: {
            kind: "StringKeyword",
            typeName: "string",
          },
          optional: false,
          modifiers: [],
        },
        {
          kind: "PropertySignature",
          name: "content",
          type: {
            kind: "StringKeyword",
            typeName: "string",
          },
          optional: false,
          modifiers: [],
        },
        {
          kind: "PropertySignature",
          name: "userId",
          type: {
            kind: "StringKeyword",
            typeName: "string",
          },
          optional: true,
          modifiers: [],
        },
        {
          kind: "PropertySignature",
          name: "user",
          type: {
            kind: "UndefinedKeyword",
            typeName: "undefined",
          },
          optional: true,
          modifiers: [],
        },
      ],
    },
  },
  {
    name: "UserEntity",
    ast: {
      kind: "ClassDeclaration",
      name: "UserEntity",
      modifiers: ["export"],
      members: [
        {
          kind: "PropertySignature",
          name: "id",
          type: {
            kind: "StringKeyword",
            typeName: "string",
          },
          optional: false,
          modifiers: [],
        },
        {
          kind: "PropertySignature",
          name: "name",
          type: {
            kind: "StringKeyword",
            typeName: "string",
          },
          optional: false,
          modifiers: [],
        },
        {
          kind: "PropertySignature",
          name: "email",
          type: {
            kind: "StringKeyword",
            typeName: "string",
          },
          optional: false,
          modifiers: [],
        },
        {
          kind: "PropertySignature",
          name: "avatar",
          type: {
            kind: "StringKeyword",
            typeName: "string",
          },
          optional: true,
          modifiers: [],
        },
        {
          kind: "PropertySignature",
          name: "posts",
          type: {
            kind: "UndefinedKeyword",
            typeName: "undefined",
          },
          optional: true,
          modifiers: [],
        },
      ],
    },
  },
];

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
    const { name, ast } = args.data;
    if (!name || !ast) {
      throw {
        status: 400,
        message: "name and ast are required",
      };
    }

    entities.push({
      name,
      ast,
    });

    return {
      name,
      ast,
    };
  }

  async update(args: UpdateArgs<Entity>): Promise<Entity> {
    const { name, ast } = args.data;
    if (!name || !ast) {
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
    entity.ast = ast;
    return entity;
  }

  async delete(args: DeletionArgs<Entity>): Promise<boolean> {
    return false;
  }
}
