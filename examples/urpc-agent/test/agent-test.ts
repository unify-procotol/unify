import { URPCAgent } from "../core/agent";

async function testAgent() {
  console.log("🚀 Starting URPC Agent test...\n");

  const agent = new URPCAgent();

  // Test cases
  const testCases = [
    "Find all users",
    "Find user with ID 1",
    "Create a new user named Jack with email jack@example.com",
    "Find all posts",
    "Find all posts by users with ID 1",
    'Create an article with title "Test Article", content "This is a test article", author is user 1',
    'Update user 1\'s name to "John Doe"',
    "Delete article with ID 1",
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test Case ${i + 1}: ${testCase}`);
    console.log("─".repeat(50));

    try {
      const result = await agent.processRequest(testCase);

      console.log("✅ Success:", result.success);
      console.log("🔧 Operation:", result.operation);
      console.log("📊 Entity:", result.entity);
      console.log("💬 Message:", result.message);

      if (result.urpc_code) {
        console.log("🔍 URPC Code:", result.urpc_code);
      }

      if (result.data) {
        console.log("📄 Data:", JSON.stringify(result.data, null, 2));
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }

  console.log("\n🎉 Test completed!");
}

// Run test
if (require.main === module) {
  testAgent().catch(console.error);
}

export { testAgent };
