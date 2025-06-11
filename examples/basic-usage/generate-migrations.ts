import { createPgTablesFromConfig } from "unify-api/migrations";
import blogConfig from "./config";

// 运行迁移
createPgTablesFromConfig([blogConfig], process.env.DATABASE_URL!);
