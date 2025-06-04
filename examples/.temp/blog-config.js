/**
 * Blog API 配置文件
 * 用于 unify-server CLI 工具
 *
 * 使用方法:
 * unify-server setup examples/blog-config.ts
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
                        type: "integer",
                        nullable: false,
                        unique: true,
                        default: "auto_increment",
                    },
                    name: {
                        type: "varchar",
                        nullable: false,
                    },
                    email: {
                        type: "varchar",
                        nullable: false,
                        unique: true,
                    },
                    age: {
                        type: "integer",
                        nullable: true,
                    },
                    created_at: {
                        type: "timestamp",
                        nullable: false,
                        default: "now()",
                    },
                    updated_at: {
                        type: "timestamp",
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
                        type: "integer",
                        nullable: false,
                        unique: true,
                        default: "auto_increment",
                    },
                    title: {
                        type: "varchar",
                        nullable: false,
                    },
                    content: {
                        type: "text",
                        nullable: true,
                    },
                    author_id: {
                        type: "integer",
                        nullable: false,
                    },
                    status: {
                        type: "varchar",
                        nullable: false,
                        default: "draft",
                    },
                    published_at: {
                        type: "timestamp",
                        nullable: true,
                    },
                    created_at: {
                        type: "timestamp",
                        nullable: false,
                        default: "now()",
                    },
                    updated_at: {
                        type: "timestamp",
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
                        type: "integer",
                        nullable: false,
                        unique: true,
                        default: "auto_increment",
                    },
                    post_id: {
                        type: "integer",
                        nullable: false,
                    },
                    author_name: {
                        type: "varchar",
                        nullable: false,
                    },
                    author_email: {
                        type: "varchar",
                        nullable: true,
                    },
                    content: {
                        type: "text",
                        nullable: false,
                    },
                    status: {
                        type: "varchar",
                        nullable: false,
                        default: "pending",
                    },
                    created_at: {
                        type: "timestamp",
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
                        type: "integer",
                        nullable: false,
                        unique: true,
                        default: "auto_increment",
                    },
                    name: {
                        type: "varchar",
                        nullable: false,
                        unique: true,
                    },
                    slug: {
                        type: "varchar",
                        nullable: false,
                        unique: true,
                    },
                    description: {
                        type: "text",
                        nullable: true,
                    },
                    created_at: {
                        type: "timestamp",
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
                        type: "integer",
                        nullable: false,
                        unique: true,
                        default: "auto_increment",
                    },
                    post_id: {
                        type: "integer",
                        nullable: false,
                    },
                    tag_id: {
                        type: "integer",
                        nullable: false,
                    },
                    created_at: {
                        type: "timestamp",
                        nullable: false,
                        default: "now()",
                    },
                },
            },
        },
    },
};
export default blogConfig;
