import { createPgTablesFromConfig } from "unify-server";
import blogConfig from "./blog-config";

// 运行迁移
createPgTablesFromConfig([blogConfig], process.env.DATABASE_URL!);
