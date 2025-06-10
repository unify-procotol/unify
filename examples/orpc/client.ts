import { createClientFromSource } from "@unify-api/client";
import { sourceConfig } from "./config";

const client = createClientFromSource(sourceConfig, {
  baseURL: "http://localhost:3000",
});

async function demo() {
  console.log("🎯 类型化SDK演示\n");

  console.log("原始curl命令:");
  console.log(
    "curl -X GET 'http://localhost:3000/user/123?source_id=orpc-demo&name=张三'\n"
  );

  console.log("使用类型化SDK:");
  console.log(
    'const response = await sdk.user.findOne({ id: 123, name: "张三" });\n'
  );

  try {
    // 这里有完整的类型提示！
    // - sdk.user 是类型安全的
    // - findOne 参数有类型检查
    // - response.data 类型是 { id: number; name: string }
    const response = await client.user.findOne({
      id: "666",
      name: "张三",
    });

    console.log("✅ 成功！");
    console.log("响应数据:", response.data);

    // 演示类型安全和运行时错误处理：
    // console.log("\n🔍 测试错误处理:");
    // await sdk.user.findOne({ id: "abc" }); // 这会导致运行时错误
  } catch (error) {
    console.log("❌ 错误:", error.message);
  }
}

demo();
