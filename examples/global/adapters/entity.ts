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
  async findMany(args: FindManyArgs<Entity>): Promise<Entity[]> {
    return entities;
  }

  async findOne(args: FindOneArgs<Entity>): Promise<Entity | null> {
    return null;
  }

  async create(args: CreationArgs<Entity>): Promise<Entity> {
    return {
      ast: {
        kind: "ClassDeclaration",
        name: "",
        modifiers: [],
        members: [],
      },
    };
  }

  async update(args: UpdateArgs<Entity>): Promise<Entity> {
    return {
      ast: {
        kind: "ClassDeclaration",
        name: "",
        modifiers: [],
        members: [],
      },
    };
  }

  async delete(args: DeletionArgs<Entity>): Promise<boolean> {
    return false;
  }
}
