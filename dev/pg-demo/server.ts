import { URPC } from "@unilab/urpc-hono";
import { PGPlugin } from "@unilab/pg-plugin";
import { logging } from "@unilab/urpc-core/middleware";

const app = URPC.init({
  plugins: [
    await PGPlugin({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        // max: 10,
        // min: 2,
        // idleTimeoutMillis: 30000,
        // connectionTimeoutMillis: 5000,
        // healthCheckInterval: 60000,
        // enableMonitoring: true,
        // logLevel: "debug",
      },
      // whitelist: [
      //   {
      //     schema: "public",
      //     tables: ["user", "like_count_view"],
      //   },
      // ],
      // If no entity configuration is provided, automatically use all database tables
      // entity: {
      //   user: {
      //     schema: "public",
      //     table: "user",
      //   },
      //   likeCount: {
      //     schema: "public",
      //     table: "like_count_view",
      //   },
      // },
      // needGenerateEntityFile: true, // Generate entity class file only if needGenerateEntityFile is true
    }),
  ],
  // middlewares: [logging()],
});

export default {
  port: 9000,
  timeout: 30000,
  fetch: app.fetch,
};
