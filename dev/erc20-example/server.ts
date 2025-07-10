import { URPC } from "@unilab/urpc-hono";
import type { Plugin } from "@unilab/urpc-core";
import { createHookMiddleware, Logging } from "@unilab/urpc-core/middleware";

// Import Mimo related files
import { PairEntity } from "./entities/pair";
import { MimoAdapter } from "./adapters/mimo-adapter";

const HookMiddleware = createHookMiddleware((hookManager) => {
  hookManager
    .beforeCreate(async (context) => {
      console.log(
        "🚀 Builder: Before Create Hook",
        "context: ",
        context
      );
    })
    .afterCreate(async (context) => {
      console.log(
        "✨ Builder: After Create Hook",
        "context: ",
        context
      );
    });
});

// Define Mimo plugin
const MimoPlugin: Plugin = {
  entities: [PairEntity],
  adapters: [
    {
      source: "mimo",
      entity: "PairEntity",
      adapter: new MimoAdapter(),
    },
  ],
};

// Create URPC app and configure
const app = URPC.init({
  plugins: [MimoPlugin],
  middlewares: [HookMiddleware, Logging()],
});

// Add health check endpoint
app.get("/", (c) => {
  return c.json({
    message: "Mimo Trading Pair Server",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      "Get trading pair price": "GET /PairEntity/find_one?source=mimo&where[pair]=iotx/iousdt",
    },
  });
});

console.log(`🚀 Mimo Trading Server is running on http://localhost:3000`);
console.log(`📖 API Documentation: http://localhost:3000`);
console.log(`💱 Pair REST API: http://localhost:3000/PairEntity/find_one?source=mimo&where[pair]=iotx/iousdt`);

export default {
  port: 3000,
  fetch: app.fetch,
}; 