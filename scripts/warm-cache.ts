// scripts/warm-cache.ts — run once after seeding
// Warms Redis with v1 of every active subject/grade in the DB
// Run: pnpm warm-cache

import dotenv from "dotenv";
dotenv.config({ override: true });

import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient({ log: ["error"] });
const redis = new Redis(process.env.REDIS_URL!);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY,
});

const REDIS_TTL = 60 * 60 * 24; // 24h

async function warmLesson(prompt: Awaited<ReturnType<typeof prisma.subjectPrompt.findFirst>>) {
  if (!prompt) return;

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

  const clean = rawText
    .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  const lesson = JSON.parse(clean);

  const slug = (prompt.topicFocus ?? prompt.subjectId)
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  const redisKey = `lesson:${prompt.grade}:${prompt.subjectId}:v${prompt.version}:${slug}`;

  // Upsert DB cache record
  await prisma.lessonCache.upsert({
    where: { redisKey },
    update: { generatedContent: lesson, useCount: { increment: 1 }, lastUsedAt: new Date() },
    create: {
      promptId: prompt.id,
      redisKey,
      cacheKey: `${prompt.grade}:${prompt.subjectId}`,
      generatedContent: lesson,
      promptVersion: prompt.version,
      useCount: 1,
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + REDIS_TTL * 1000),
    },
  });

  await redis.set(redisKey, JSON.stringify(lesson), "EX", REDIS_TTL);

  return { lesson, redisKey };
}

async function main() {
  console.log("🔥 Warming lesson cache — all active subjects...\n");

  // Pull v1 of every active subject/grade from DB
  const prompts = await prisma.subjectPrompt.findMany({
    where: { isActive: true, version: 1 },
    orderBy: [{ subjectId: "asc" }, { grade: "asc" }],
  });

  if (prompts.length === 0) {
    console.error("❌ No active prompts found. Run seeds first.");
    process.exit(1);
  }

  console.log(`Found ${prompts.length} subjects to warm:\n`);

  let warmed = 0;
  let failed = 0;

  for (const prompt of prompts) {
    process.stdout.write(`  ${prompt.subjectId} grade ${prompt.grade} v${prompt.version}... `);
    try {
      const result = await warmLesson(prompt);
      console.log(`✅ "${result?.lesson.title}"`);
      console.log(`     → ${result?.redisKey}`);
      warmed++;
    } catch (e) {
      console.log(`❌ ${(e as Error).message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Done — ${warmed} warmed · ${failed} failed\n`);
  redis.disconnect();
}

main()
  .catch((e) => { console.error("❌ Cache warming failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
