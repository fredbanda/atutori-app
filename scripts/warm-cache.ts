// scripts/warm-cache.ts — run once after seeding
// Generates initial lessons and caches them in Redis for faster first-time loading

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";
import { Redis } from "@upstash/redis";

// Simple clients for warming
const prisma = new PrismaClient({
  log: ["error"],
});

const redis = Redis.fromEnv();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY,
});

// Copy the generateLesson logic but with simple clients
async function generateLessonForWarming(grade: number, subjectId: string) {
  // Load prompt from database
  const prompt = await prisma.subjectPrompt.findFirst({
    where: { subjectId, grade, isActive: true },
    orderBy: { version: "desc" },
  });

  if (!prompt) {
    throw new Error(
      `No active SubjectPrompt found for grade ${grade}, subject "${subjectId}"`
    );
  }

  // Call Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: prompt.systemPrompt,
    messages: [{ role: "user", content: prompt.userPrompt }],
  });

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Parse lesson
  const clean = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const lesson = JSON.parse(clean);

  // Save to cache
  const topicFocus = prompt.topicFocus ?? subjectId;
  const slug = topicFocus
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const redisKey = `lesson:${grade}:${subjectId}:${slug}`;

  await redis.set(redisKey, JSON.stringify(lesson), { ex: 60 * 60 * 24 });

  return { lesson, redisKey };
}

const lessons = [
  { grade: 1, subjectId: "math" },
  { grade: 2, subjectId: "math" },
];

async function warmCache() {
  console.log("🔥 Warming lesson cache with AI-generated content...\n");

  for (const { grade, subjectId } of lessons) {
    console.log(`  Warming grade ${grade} ${subjectId}...`);
    try {
      const result = await generateLessonForWarming(grade, subjectId);
      console.log(`  ✅ Generated: "${result.lesson.title}"`);
      console.log(`     Cached in Redis: ${result.redisKey}`);
      console.log(
        `     Steps: ${result.lesson.steps.length} (${result.lesson.estimatedMinutes} min)\n`
      );
    } catch (error) {
      console.error(
        `  ❌ Failed to generate ${subjectId} lesson for grade ${grade}:`,
        error
      );
      process.exit(1);
    }
  }

  console.log(
    "🎉 Cache warming complete! All lessons are now ready for instant delivery.\n"
  );
  console.log("🧪 Test your lessons:");
  lessons.forEach(({ grade, subjectId }) => {
    console.log(
      `   - Grade ${grade} ${subjectId}: generateLesson(${grade}, "${subjectId}")`
    );
  });
}

warmCache()
  .catch((e) => {
    console.error("❌ Cache warming failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
