import { URPCAgent } from "../core/agent";

async function testAgent() {
  console.log("🚀 开始测试URPC Agent...\n");

  const agent = new URPCAgent();

  // 测试用例
  const testCases = [
    "查找所有用户",
    "查找ID为1的用户",
    "创建一个新用户，名字叫小明，邮箱是xiaoming@example.com",
    "查找用户张三的所有文章",
    '创建一篇文章，标题是"测试文章"，内容是"这是一篇测试文章"，作者是用户1',
    '更新用户1的名字为"张三丰"',
    "删除ID为4的文章",
    "统计所有用户数量",
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 测试用例 ${i + 1}: ${testCase}`);
    console.log("─".repeat(50));

    try {
      const result = await agent.processRequest(testCase);

      console.log("✅ 成功:", result.success);
      console.log("🔧 操作:", result.operation);
      console.log("📊 实体:", result.entity);
      console.log("💬 消息:", result.message);

      if (result.urpc_code) {
        console.log("🔍 URPC代码:", result.urpc_code);
      }

      if (result.data) {
        console.log("📄 数据:", JSON.stringify(result.data, null, 2));
      }
    } catch (error) {
      console.error("❌ 错误:", error);
    }
  }

  console.log("\n🎉 测试完成!");
}

// 运行测试
if (require.main === module) {
  testAgent().catch(console.error);
}

export { testAgent };
