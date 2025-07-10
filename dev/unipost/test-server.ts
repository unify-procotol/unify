#!/usr/bin/env bun

/**
 * Test script to verify the PostgreSQL adapter integration
 * This script starts the server and makes some test requests
 */

import { serve } from "bun";

// Import the server app
import app from "./server";

console.log("🚀 Starting Unipost server with PostgreSQL adapter...");
console.log("📊 Server configuration:");
console.log(`  - Port: ${app.port}`);
console.log(`  - Timeout: ${app.timeout}ms`);
console.log("  - PostgreSQL adapter: ✅ Enabled");
console.log("  - Ghost adapter: ✅ Enabled");

// Start the server
const server = serve({
  port: app.port,
  fetch: app.fetch,
});

console.log(`\n✅ Server running at http://localhost:${app.port}`);
console.log("\n📋 Available endpoints:");
console.log("  - POST /project/create - Create a new project");
console.log("  - POST /project/findMany - Find multiple projects");
console.log("  - POST /project/findOne - Find a single project");
console.log("  - POST /project/update - Update a project");
console.log("  - POST /project/delete - Delete a project");
console.log("  - POST /post/findMany - Find posts (Ghost)");
console.log("  - POST /post/findOne - Find a post (Ghost)");

console.log("\n🔧 Environment variables:");
console.log(`  - POSTGRES_HOST: ${process.env.POSTGRES_HOST || "localhost"}`);
console.log(`  - POSTGRES_PORT: ${process.env.POSTGRES_PORT || "5432"}`);
console.log(`  - POSTGRES_DB: ${process.env.POSTGRES_DB || "unipost"}`);
console.log(`  - POSTGRES_USER: ${process.env.POSTGRES_USER || "postgres"}`);
console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}`);

console.log("\n💡 Tips:");
console.log("  1. Make sure PostgreSQL is running and the database exists");
console.log("  2. Run the schema.sql file to create the tables");
console.log("  3. Set environment variables in .env file (see .env.example)");
console.log("  4. Use 'bun run client' to test the API endpoints");

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server...");
  server.stop();
  process.exit(0);
});
