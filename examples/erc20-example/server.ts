import { Unify } from "@unilab/unify-hono";
import type { Plugin } from "@unilab/core";
import { createHookMiddleware, Logging } from "@unilab/core/middleware";

// 导入Mimo相关文件
import { PairEntity } from "./entities/pair";
import { MimoAdapter } from "./adapters/mimo-adapter";

const HookMiddleware = createHookMiddleware((hookManager) => {
  hookManager
    .beforeCreate(async (args, _, context) => {
      console.log(
        "🚀 Builder: Before Create Hook",
        "args: ",
        args,
        "context: ",
        context
      );
    })
    .afterCreate(async (args, result, context) => {
      console.log(
        "✨ Builder: After Create Hook",
        "result: ",
        result,
        "context: ",
        context
      );
    });
});

// 定义Mimo插件
const MimoPlugin: Plugin = {
  entities: [PairEntity],
  adapters: [
    {
      source: "mimo",
      entityName: "PairEntity",
      adapter: new MimoAdapter(),
    },
  ],
};

// 创建Unify应用并配置  
const app = Unify.init({
  plugins: [MimoPlugin],
  middleware: [HookMiddleware, Logging()],
});

// 添加健康检查端点
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