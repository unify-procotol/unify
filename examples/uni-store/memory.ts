import { UserEntity } from "./entities/user";
import { repo, getCacheStats } from "@unilab/uni-store";

async function test() {
  console.log("🚀 Starting entity repository test...");

  // Create user
  const user1 = await repo(UserEntity).create({
    data: {
      id: "1",
      name: "test",
      email: "test@test.com",
      avatar: "test.png",
    },
  });
  console.log("✅ Created user:", user1);
  user1.click("test123");

  console.log(
    "✅ click:",
    (await repo(UserEntity).findOne({ where: { id: "1" } }))?.name
  );

  // Update user
  const updatedUser = await repo(UserEntity).update({
    where: { id: "1" },
    data: { name: "test2" },
  });
  console.log("✅ Updated user:", updatedUser);

  // Upsert user (should update existing)
  const upsertedUser = await repo(UserEntity).upsert({
    where: { id: "1" },
    update: { name: "test2-updated" },
    create: {
      id: "1",
      name: "test3",
      email: "test3@test.com",
      avatar: "test3.png",
    },
  });
  console.log("✅ Upserted user (updated existing):", upsertedUser);

  // Find one user
  const foundUser = await repo(UserEntity).findOne({
    where: { id: "1" },
  });
  console.log("✅ Found user:", foundUser);

  // Create more users to test LRU cache
  for (let i = 2; i <= 7; i++) {
    await repo(UserEntity).create({
      data: {
        id: i.toString(),
        name: `user${i}`,
        email: `user${i}@test.com`,
        avatar: `user${i}.png`,
      },
    });
  }

  // Find many users
  const allUsers = await repo(UserEntity).findMany();
  console.log(
    "✅ All users (should be max 5 due to LRU cache):",
    allUsers.length,
    "users"
  );

  // Count users
  const userCount = await repo(UserEntity).count();
  console.log("✅ User count:", userCount);

  // Test cache stats
  console.log("📊 Cache stats:", getCacheStats());

  // Test delete functionality with a user that should exist
  const userToDelete = await repo(UserEntity).findOne({
    where: { id: "7" },
  });
  console.log("🔍 User to delete:", userToDelete);

  const deleted = await repo(UserEntity).delete({
    where: { id: "7" },
  });
  console.log("✅ Deleted user:", deleted);

  // Verify deletion
  const deletedUser = await repo(UserEntity).findOne({
    where: { id: "7" },
  });
  console.log("🔍 User after deletion (should be null):", deletedUser);

  // Final count
  const finalCount = await repo(UserEntity).count();
  console.log("✅ Final user count:", finalCount);

  console.log("🎉 Test completed successfully!");
}

test().catch(console.error);
