import { os } from "@orpc/server";
import { z } from "zod";

export const ORPC_DEMO_SOURCE_CONFIG = {
  id: "orpc-demo",
  entities: {
    user: {
      findOne: os
        .input(
          z.object({
            id: z.coerce.number().int().min(1),
            name: z.string(),
          })
        )
        .output(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        )
        .handler(({ input }) => {
          return {
            id: input.id,
            name: input.name,
          };
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
          },
          name: {
            type: "varchar" as const,
            nullable: false,
          },
        },
      },
    },
  },
} as const;
