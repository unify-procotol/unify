import { createPgTablesFromConfig } from "@unify/storage/migrations";
import { BasicUsageSourceConfig } from "./config";

createPgTablesFromConfig([BasicUsageSourceConfig], process.env.DATABASE_URL!);
