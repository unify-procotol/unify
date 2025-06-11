/**
 * Blog API 配置文件
 * 用于 unify-api CLI 工具
 *
 * 使用方法:
 * bun run unify-api/dist/cli.js setup blog-config.ts
 */

import { SourceConfig } from "unify-api";

const blogConfig: SourceConfig = {
  id: "blog",
  entities: {
    // 用户实体
    user: {
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
          email: {
            type: "varchar" as const,
            nullable: false,
            unique: true,
          },
          age: {
            type: "integer" as const,
            nullable: true,
          },
          created_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
          updated_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
        },
      },
    },

    // 文章实体
    post: {
      table: {
        name: "posts",
        schema: "public",
        columns: {
          id: {
            type: "integer" as const,
            nullable: false,
            unique: true,
            default: "AUTO_INCREMENT",
          },
          title: {
            type: "varchar" as const,
            nullable: false,
          },
          content: {
            type: "text" as const,
            nullable: true,
          },
          author_id: {
            type: "integer" as const,
            nullable: false,
          },
          status: {
            type: "varchar" as const,
            nullable: false,
            default: "draft",
          },
          published_at: {
            type: "timestamp" as const,
            nullable: true,
          },
          created_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
          updated_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
        },
      },
    },

    // 评论实体
    comment: {
      table: {
        name: "comments",
        schema: "public",
        columns: {
          id: {
            type: "integer" as const,
            nullable: false,
            unique: true,
            default: "AUTO_INCREMENT",
          },
          post_id: {
            type: "integer" as const,
            nullable: false,
          },
          author_name: {
            type: "varchar" as const,
            nullable: false,
          },
          author_email: {
            type: "varchar" as const,
            nullable: true,
          },
          content: {
            type: "text" as const,
            nullable: false,
          },
          status: {
            type: "varchar" as const,
            nullable: false,
            default: "pending",
          },
          created_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
        },
      },
    },

    // 标签实体
    tag: {
      table: {
        name: "tags",
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
            unique: true,
          },
          slug: {
            type: "varchar" as const,
            nullable: false,
            unique: true,
          },
          description: {
            type: "text" as const,
            nullable: true,
          },
          created_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
        },
      },
    },

    // 文章标签关联表
    post_tag: {
      table: {
        name: "post_tags",
        schema: "public",
        columns: {
          id: {
            type: "integer" as const,
            nullable: false,
            unique: true,
            default: "AUTO_INCREMENT",
          },
          post_id: {
            type: "integer" as const,
            nullable: false,
          },
          tag_id: {
            type: "integer" as const,
            nullable: false,
          },
          created_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
        },
      },
    },
  },
};

export default blogConfig;
