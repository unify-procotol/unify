import { os } from "@orpc/server";
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number(),
});

export const ORPC_DEMO_SOURCE_CONFIG = {
  id: "orpc-demo",
  entities: {
    user: {
      findMany: os
        .input(
          z.object({
            where: UserSchema.partial().extend({
              id: z.coerce.number().int().min(1).optional(),
            }),
            select: z.array(UserSchema.keyof()).optional(),
            order_by: z
              .record(UserSchema.keyof(), z.enum(["asc", "desc"]))
              .optional(),
          })
        )
        .output(z.array(UserSchema.partial()))
        .handler(({ input }) => {
          const { where, select, order_by } = input;
          console.log("where:", where);
          console.log("select:", select);
          console.log("order_by:", order_by);
          return [];
        }),
      findOne: os
        .input(
          z.object({
            where: z.object({
              id: z.coerce.number().int().min(1),
            }),
            select: z.array(UserSchema.keyof()).optional(),
          })
        )
        .output(UserSchema.partial())
        .handler(({ input }) => {
          const { where, select } = input;
          console.log("where:", where);
          console.log("select:", select);

          const _user = {
            id: where.id,
            name: "test",
            age: 18,
          };

          if (select) {
            // 如果select存在，则返回select中的字段
            const result: Partial<typeof _user> = {};
            select.forEach((key) => {
              (result as any)[key] = _user[key];
            });
            return result;
          }

          return _user;
        }),
    },
    user2: {
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
} as const;
