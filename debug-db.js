const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neon, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");

// Required for local dev
if (process.env.NODE_ENV !== "production") {
  neonConfig.webSocketConstructor = ws;
}

// Create Prisma client
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});

async function debugDatabase() {
  try {
    console.log("🔍 Checking subjects in database...");

    const allSubjects = await prisma.subjectPrompt.findMany({
      where: { grade: 1 },
      select: {
        id: true,
        subjectId: true,
        subjectName: true,
        grade: true,
        version: true,
        isActive: true,
      },
      orderBy: [{ subjectId: "asc" }, { version: "asc" }],
    });

    console.log(`Found ${allSubjects.length} Grade 1 subjects:`);
    allSubjects.forEach((s) => {
      console.log(
        `- ${s.subjectId} (${s.subjectName}) v${s.version} ${
          s.isActive ? "✅" : "❌"
        }`
      );
    });

    // Test specific query with full prompt details
    console.log("\n🧪 Testing query for counting version 1...");
    const countingV1 = await prisma.subjectPrompt.findFirst({
      where: { subjectId: "counting", grade: 1, version: 1, isActive: true },
      select: {
        id: true,
        subjectId: true,
        subjectName: true,
        version: true,
        systemPrompt: true,
        userPrompt: true,
        contentSteps: true,
        quizCount: true,
      },
    });

    if (countingV1) {
      console.log("✅ Found counting v1:", {
        id: countingV1.id,
        subjectId: countingV1.subjectId,
        subjectName: countingV1.subjectName,
        version: countingV1.version,
        systemPromptLength: countingV1.systemPrompt?.length || 0,
        userPromptLength: countingV1.userPrompt?.length || 0,
        contentSteps: countingV1.contentSteps,
        quizCount: countingV1.quizCount,
      });

      console.log("\n📝 System Prompt (first 200 chars):");
      console.log(countingV1.systemPrompt?.slice(0, 200) || "No system prompt");

      console.log("\n👤 User Prompt (first 200 chars):");
      console.log(countingV1.userPrompt?.slice(0, 200) || "No user prompt");
    } else {
      console.log("❌ No counting v1 found");
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();
