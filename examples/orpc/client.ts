import { createClientFromSource } from "@unify-api/client";
import { ORPC_DEMO_SOURCE_CONFIG } from "./config";

const client = createClientFromSource(ORPC_DEMO_SOURCE_CONFIG, {
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
    'const response = await client.user.findOne({ id: 123, name: "张三" });\n'
  );

  try {
    const response = await client.user.findOne({
      id: 123,
      name: "张三",
    });

    console.log("✅ 成功！");
    console.log("响应数据:", response.data);
    // console.log("响应状态:", response.status);
    // console.log("响应头:", response.headers);

    // await client.user2.create({
    //   id: 789,
    //   name: "test",
    // });

    // 演示类型安全和运行时错误处理：
    // console.log("\n🔍 测试错误处理:");
    // @ts-ignore
    // await client.user.findOne({ id: "abc" }); // 验证参数错误，返回400
  } catch (error) {
    console.log("❌ 错误:", error.message);
  }
}

demo();
