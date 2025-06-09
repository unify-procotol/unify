import { createPgTablesFromConfig } from "unify-api/migrations";
import blogConfig from "./blog-config";

// 运行迁移
createPgTablesFromConfig([blogConfig], process.env.DATABASE_URL!);
