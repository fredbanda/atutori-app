const { PrismaClient } = require("@prisma/client");
const { Redis } = require("@upstash/redis");

// Test Redis connection
async function testRedis() {
  console.log("🔴 Testing Redis connection...");

  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL?.replace(/^['"]|['"]$/g, ""),
      token: process.env.KV_REST_API_TOKEN?.replace(/^['"]|['"]$/g, ""),
    });

    // Test set and get
    await redis.set("test-key", { message: "Hello Redis!" });
    const result = await redis.get("test-key");

    console.log("✅ Redis test successful!");
    console.log("📦 Stored data:", { message: "Hello Redis!" });
    console.log("📥 Retrieved data:", result);
    console.log("🔍 Data type:", typeof result);
    console.log("🔍 Is string?", typeof result === "string");

    // Test JSON parsing
    if (typeof result === "string") {
      try {
        const parsed = JSON.parse(result);
        console.log("✅ JSON parsing successful:", parsed);
      } catch (e) {
        console.log("❌ JSON parsing failed:", e.message);
      }
    } else {
      console.log("✅ Data already parsed as object");
    }

    return true;
  } catch (error) {
    console.error("❌ Redis test failed:", error);
    return false;
  }
}

// Test Database connection
async function testDatabase() {
  console.log("🗄️ Testing database connection...");

  try {
    const prisma = new PrismaClient();
    const promptCount = await prisma.subjectPrompt.count();
    console.log("✅ Database connection successful!");
    console.log("📊 Subject prompts in database:", promptCount);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("🧪 Running system tests...\n");

  require("dotenv").config();

  const redisOk = await testRedis();
  console.log("");
  const dbOk = await testDatabase();

  console.log("\n📋 Test Results:");
  console.log(`Redis: ${redisOk ? "✅" : "❌"}`);
  console.log(`Database: ${dbOk ? "✅" : "❌"}`);

  if (redisOk && dbOk) {
    console.log(
      "\n🎉 All systems are working! Ready to test lesson generation."
    );
  } else {
    console.log(
      "\n⚠️ Some systems need attention before testing lesson generation."
    );
  }
}

runTests();
