import { os } from "@orpc/server";
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number(),
});

const BasicUsageUsers = [
  {
    id: 1,
    name: "test",
    age: 18,
  },
  {
    id: 2,
    name: "test2",
    age: 20,
  },
];

export const BasicUsageSourceConfig = {
  id: "basic-usage",
  entities: {
    user: {
      findMany: os
        .input(
          z.object({
            where: UserSchema.partial().extend({
              id: z.coerce.number().int().min(1).optional(),
            }).optional(),
            select: z.array(UserSchema.keyof()).optional(),
            order_by: z
              .record(UserSchema.keyof(), z.enum(["asc", "desc"]))
              .optional(),
            offset: z.coerce.number().int().min(0).optional(),
            limit: z.coerce.number().int().min(1).optional(),
          })
        )
        .output(z.array(UserSchema.partial()))
        .handler(({ input }) => {
          const { where, select, order_by, offset, limit } = input;
          if (where) {
            return BasicUsageUsers.filter((user) => {
              return Object.entries(where).every(([key, value]) => {
                return user[key] === value;
              });
            });
          }
          if (offset) {
            return BasicUsageUsers.slice(offset);
          }
          if (limit) {
            return BasicUsageUsers.slice(0, limit);
          }
          if (select) {
            return BasicUsageUsers.map((user) => {
              return select.reduce((acc, key) => {
                acc[key] = user[key];
                return acc;
              }, {} as Record<string, any>);
            });
          }
          if (order_by) {
            const [field, direction] = Object.entries(order_by)[0];
            return BasicUsageUsers.sort((a, b) => {
              return direction === "asc"
                ? a[field] - b[field]
                : b[field] - a[field];
            });
          }
          return BasicUsageUsers;
        }),
      findOne: os
        .input(
          z.object({
            where: UserSchema.partial().extend({
              id: z.coerce.number().int().min(1).optional(),
            }),
            select: z.array(UserSchema.keyof()).optional(),
          })
        )
        .output(UserSchema.partial().nullable())
        .handler(({ input }) => {
          const { where, select } = input;
          const record = BasicUsageUsers.find((r) => {
            return Object.entries(where).every(
              ([key, value]) => r[key] === value
            );
          });
          if (!record) {
            return null;
          }
          if (select) {
            return select.reduce((acc, key) => {
              acc[key] = record[key];
              return acc;
            }, {} as Record<string, any>);
          }
          return record;
        }),
    },
    user_table: {
      table: {
        name: "users",
        schema: "public",
        columns: {
          id: {
            type: "integer" as const,
            nullable: false,
            unique: true,
            default: "AUTO_INCREMENT",
          },
          name: {
            type: "varchar" as const,
            nullable: false,
          },
          age: {
            type: "integer" as const,
            nullable: true,
          },
        },
      },
    },
  },
};
