/**
 * Blog API 配置文件
 * 用于 unify-server CLI 工具
 *
 * 使用方法:
 * bun run unify-server/dist/cli.js setup blog-config.ts
 */

const blogConfig = {
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
            default: "auto_increment",
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
            default: "now()",
          },
          updated_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "now()",
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
            default: "auto_increment",
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
            default: "now()",
          },
          updated_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "now()",
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
            default: "auto_increment",
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
            default: "now()",
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
            default: "auto_increment",
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
            default: "now()",
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
            default: "auto_increment",
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
            default: "now()",
          },
        },
      },
    },
  },
};

export default blogConfig;
