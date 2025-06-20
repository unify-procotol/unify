import { UnifyClient } from "@unify/client";
import type { BaseEntity } from "@unify/core";

// Define User entity interface (same as server)
interface User extends BaseEntity {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Initialize the client
const client = new UnifyClient({
  baseUrl: "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a repository for User entity
const userRepo = client.createRepositoryProxy<User>("users", "mock");

// Demo functions
async function demoFindMany() {
  console.log("\n🔍 === Testing findMany ===");
  
  try {
    // Find all users
    console.log("📋 Finding all users:");
    const allUsers = await userRepo.findMany({});
    console.log("Result:", allUsers);

    // Find users with limit
    console.log("\n📋 Finding users with limit 2:");
    const limitedUsers = await userRepo.findMany({ limit: 2 });
    console.log("Result:", limitedUsers);

    // Find users with where condition
    console.log("\n📋 Finding users where name contains 'John':");
    const johnUsers = await userRepo.findMany({
      where: { name: "John Doe" }
    });
    console.log("Result:", johnUsers);

    // Find users with select fields
    console.log("\n📋 Finding users with selected fields (name, email):");
    const selectedUsers = await userRepo.findMany({
      select: ["name", "email"]
    });
    console.log("Result:", selectedUsers);

    // Find users with ordering
    console.log("\n📋 Finding users ordered by age desc:");
    const orderedUsers = await userRepo.findMany({
      order_by: { age: "desc" }
    });
    console.log("Result:", orderedUsers);

  } catch (error) {
    console.error("❌ Error in findMany:", error);
  }
}

async function demoFindOne() {
  console.log("\n🎯 === Testing findOne ===");
  
  try {
    // Find user by ID
    console.log("🔍 Finding user with id '1':");
    const user = await userRepo.findOne({
      where: { id: "1" }
    });
    console.log("Result:", user);

    // Find user with select fields
    console.log("\n🔍 Finding user with selected fields:");
    const selectedUser = await userRepo.findOne({
      where: { id: "2" },
      select: ["name", "email"]
    });
    console.log("Result:", selectedUser);

    // Try to find non-existent user
    console.log("\n🔍 Finding non-existent user:");
    const notFound = await userRepo.findOne({
      where: { id: "999" }
    });
    console.log("Result:", notFound);

  } catch (error) {
    console.error("❌ Error in findOne:", error);
  }
}

async function demoCreate() {
  console.log("\n➕ === Testing create ===");
  
  try {
    // Create new user
    console.log("➕ Creating new user:");
    const newUser = await userRepo.create({
      data: {
        name: "Alice Cooper",
        email: "alice@example.com",
        age: 28
      }
    });
    console.log("Result:", newUser);

    // Create another user
    console.log("\n➕ Creating another user:");
    const anotherUser = await userRepo.create({
      data: {
        name: "Charlie Brown",
        email: "charlie@example.com",
        age: 22
      }
    });
    console.log("Result:", anotherUser);

  } catch (error) {
    console.error("❌ Error in create:", error);
  }
}

async function demoUpdate() {
  console.log("\n✏️ === Testing update ===");
  
  try {
    // Update user by ID
    console.log("✏️ Updating user with id '1':");
    const updatedUser = await userRepo.update({
      where: { id: "1" },
      data: { age: 26, name: "John Doe Updated" }
    });
    console.log("Result:", updatedUser);

    // Update user by email
    console.log("\n✏️ Updating user by email:");
    const updatedByEmail = await userRepo.update({
      where: { email: "jane@example.com" },
      data: { age: 31 }
    });
    console.log("Result:", updatedByEmail);

  } catch (error) {
    console.error("❌ Error in update:", error);
  }
}

async function demoDelete() {
  console.log("\n🗑️ === Testing delete ===");
  
  try {
    // Delete user by ID
    console.log("🗑️ Deleting user with id '3':");
    const deleted = await userRepo.delete({
      where: { id: "3" }
    });
    console.log("Result:", deleted);

    // Try to delete non-existent user
    console.log("\n🗑️ Trying to delete non-existent user:");
    const notDeleted = await userRepo.delete({
      where: { id: "999" }
    });
    console.log("Result:", notDeleted);

  } catch (error) {
    console.error("❌ Error in delete:", error);
  }
}

async function demoHealthCheck() {
  console.log("\n❤️ === Testing health check ===");
  
  try {
    const response = await fetch("http://localhost:3001/health");
    const health = await response.json();
    console.log("Health check result:", health);
    return true;
  } catch (error) {
    console.error("❌ Error in health check:", error);
    return false;
  }
}

// Main demo function
async function runDemo() {
  console.log("🚀 Starting Unify Client Demo");
  console.log("📡 Connecting to server at http://localhost:3001");

  // Check if server is running
  const serverRunning = await demoHealthCheck();
  if (!serverRunning) {
    console.error("❌ Server is not running! Please start the server first:");
    console.error("   bun run server.ts");
    process.exit(1);
  }

  console.log("✅ Server is running!");

  // Run all demos
  await demoFindMany();
  await demoFindOne();
  await demoCreate();
  await demoUpdate();
  await demoDelete();

  // Show final state
  console.log("\n📊 === Final State ===");
  try {
    const finalUsers = await userRepo.findMany({});
    console.log("All users after operations:", finalUsers);
  } catch (error) {
    console.error("❌ Error getting final state:", error);
  }

  console.log("\n✅ Demo completed!");
}

// Alternative: Using static Repo method (global client approach)
async function demoStaticRepo() {
  console.log("\n🔧 === Testing Static Repo Method ===");
  
  try {
    // Initialize global client
    UnifyClient.init({
      baseUrl: "http://localhost:3001",
      timeout: 10000,
    });

    // Use static Repo method
    const staticUserRepo = UnifyClient.Repo<User>("users", "mock");
    
    const users = await staticUserRepo.findMany({ limit: 1 });
    console.log("Static repo result:", users);

  } catch (error) {
    console.error("❌ Error in static repo demo:", error);
  }
}

// Run the demo
if (import.meta.main) {
  runDemo()
    .then(() => demoStaticRepo())
    .catch(console.error);
}