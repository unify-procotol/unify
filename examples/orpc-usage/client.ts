import { createClientFromSource } from "@unify-api/client";
import { ORPC_DEMO_SOURCE_CONFIG } from "./config";

const client = createClientFromSource(ORPC_DEMO_SOURCE_CONFIG, {
  baseURL: "http://localhost:3000",
});

async function demo() {
  console.log("🎯 类型化SDK演示\n");

  console.log("原始curl命令:");
  console.log(
    "curl -X GET 'http://localhost:3000/user/find_one?source_id=orpc-demo&where={\"id\":123}'\n"
  );

  console.log("使用类型化SDK:");
  console.log(
    "const response = await client.user.findOne({ where: { id: 123 } });\n"
  );

  try {
    // const findManyRes = await client.user.findMany({
    //   where: {
    //     name: "test",
    //   },
    //   select: ["id"],
    //   order_by: {
    //     id: "asc",
    //   },
    // });

    // const findOneRes = await client.user.findOne({
    //   where: {
    //     id: 123,
    //   },
    //   select: ["id", "name"],
    // });

    // console.log("✅ 成功！");
    // console.log("findManyRes:", findManyRes.data);
    // console.log("findOneRes:", findOneRes.data);
    // console.log("响应状态:", response.status);
    // console.log("响应头:", response.headers);

    const findManyRes2 = await client.user2.findMany({
      where: {
        name: "test",
      },
      select: ["id"],
      order_by: {
        id: "asc",
      },
    });

    console.log("findManyRes2:", findManyRes2.data);

    const findOneRes2 = await client.user2.findOne({
      where: {
        id: 1,
      },
      // select: ["id"],
    });

    console.log("findOneRes2:", findOneRes2.data);

    // await client.user2.create({
    //   data: {
    //     id: 1,
    //     name: "test",
    //     age: 18,
    //   },
    // });

    const updateRes = await client.user2.update({
      where: {
        id: 1,
      },
      data: {
        name: "test1",
      },
    });

    console.log("updateRes:", updateRes.data);

    // 演示类型安全和运行时错误处理：
    // console.log("\n🔍 测试错误处理:");
    // @ts-ignore
    // await client.user.findOne({ id: "abc" }); // 验证参数错误，返回400
  } catch (error) {
    console.log("❌ 错误:", error.message);
  }
}

demo();
