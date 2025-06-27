import { UserEntity } from "./entities/user";
import { entity, getEntityPoolStats } from "@unilab/unify";

console.log("=== WeakMap Entity Test ===\n");

// Test 1: Basic functionality with same object reference
console.log("1. Testing basic functionality with same object reference:");
const obj1 = {
  id: "1",
  name: "Alice",
  email: "alice@test.com",
  avatar: "alice.png",
};

const user1 = entity(UserEntity).Get(obj1);
console.log(`Initial: ${user1.name}`);

// Modify the instance
user1.click("Modified Alice");
console.log(`After click: ${user1.name}`);

// Get the same instance again - should return the modified instance
const user1Again = entity(UserEntity).Get(obj1);
console.log(`Same object again: ${user1Again.name}`);
console.log(`Same instance reference? ${user1 === user1Again}`);

// Test 2: Different object with same values
console.log("\n2. Testing different object with same values:");
const obj1Copy = {
  id: "1",
  name: "Alice", // original name, not modified
  email: "alice@test.com",
  avatar: "alice.png",
  age: 25,
};

const user1Copy = entity(UserEntity).Get(obj1Copy);
console.log(`Different object, same values: ${user1Copy.name}`);
console.log(`Different instance reference? ${user1 !== user1Copy}`);

// Test 3: Demonstrating automatic garbage collection
console.log("\n3. Testing automatic garbage collection:");
function createTemporaryEntity() {
  const tempObj = {
    id: "temp",
    name: "Temporary",
    email: "temp@test.com",
    avatar: "temp.png",
    age: 99,
  };

  const tempUser = entity(UserEntity).Get(tempObj);
  tempUser.click("Temp Modified");
  console.log(`Temporary entity created: ${tempUser.name}`);

  // tempObj will be eligible for garbage collection when this function exits
  // and there are no other references to it
}

createTemporaryEntity();

// Force garbage collection (if available)
if (global.gc) {
  console.log("Forcing garbage collection...");
  global.gc();
} else {
  console.log("Garbage collection not available in this environment");
}

// Test 4: Pool statistics
console.log("\n4. Pool statistics:");
const stats = getEntityPoolStats(UserEntity);
console.log(`Stats:`, stats);

console.log("\n=== WeakMap Test Complete ===");
console.log("Note: WeakMap automatically handles garbage collection");
console.log("when object keys are no longer referenced elsewhere.");
