// scripts/warm-cache-demo.ts — demo version without AI API calls
// Run once after seeding to set up cache structure

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient({ log: ["error"] });
const redis = new Redis(process.env.REDIS_URL!);

// Mock lesson generation (replace with actual AI call when API key is valid)
async function generateMockLesson(grade: number, subjectId: string) {
  // Load prompt from database to verify seeding worked
  const prompt = await prisma.subjectPrompt.findFirst({
    where: { subjectId, grade, isActive: true },
    orderBy: { version: "desc" },
  });

  if (!prompt) {
    throw new Error(
      `No active SubjectPrompt found for grade ${grade}, subject "${subjectId}"`
    );
  }

  // Mock lesson data (would come from AI in real version)
  const mockLesson = {
    title: `Grade ${grade} Math Adventure! 🔢`,
    cambridgeStage: "KS1",
    subject: "Mathematics",
    grade,
    estimatedMinutes: 10,
    steps: [
      {
        type: "content",
        title: "Let's Count!",
        content:
          "Welcome to our counting adventure! We'll learn to count objects together.",
        example: "🍎🍎🍎 — that's 3 apples!",
      },
      {
        type: "content",
        title: "More Counting",
        content: "Now let's count different objects and see how numbers work!",
        example: "🐶🐶 — that's 2 dogs!",
      },
      {
        type: "content",
        title: "Practice Time",
        content: "You're doing great! Let's practice with one more example.",
        example: "⭐⭐⭐⭐ — that's 4 stars!",
      },
      {
        type: "quiz",
        question: "How many balloons do you see? 🎈🎈🎈",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1,
        explanation: "Amazing! 🎉 There are 3 balloons!",
        hint: "Try counting each balloon slowly! 👆",
      },
      {
        type: "quiz",
        question: "Count the hearts: ❤️❤️",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "You got it! ⭐ There are 2 hearts!",
        hint: "Point to each heart as you count! 👆",
      },
      {
        type: "quiz",
        question: "How many cars? 🚗🚗🚗🚗🚗",
        options: ["3", "4", "5", "6"],
        correctAnswer: 2,
        explanation: "Fantastic! 🌟 You counted 5 cars perfectly!",
        hint: "Take your time and count carefully! 👆",
      },
    ],
  };

  // Save to cache
  const topicFocus = prompt.topicFocus ?? subjectId;
  const slug = topicFocus
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const redisKey = `lesson:${grade}:${subjectId}:${slug}`;

  await redis.set(redisKey, JSON.stringify(mockLesson), "EX", 60 * 60 * 24);

  return { lesson: mockLesson, redisKey, prompt };
}

const lessons = [
  { grade: 1, subjectId: "math" },
  { grade: 2, subjectId: "math" },
];

async function warmCache() {
  console.log("🔥 Warming lesson cache with demo content...\n");
  console.log(
    "📝 Note: Using mock lessons. Replace with AI-generated content when API key is configured.\n"
  );

  for (const { grade, subjectId } of lessons) {
    console.log(`  Warming grade ${grade} ${subjectId}...`);
    try {
      const result = await generateMockLesson(grade, subjectId);
      console.log(`  ✅ Generated: "${result.lesson.title}"`);
      console.log(`     Cached in Redis: ${result.redisKey}`);
      console.log(
        `     Steps: ${result.lesson.steps.length} (${result.lesson.estimatedMinutes} min)`
      );
      console.log(`     From prompt: "${result.prompt.topicFocus}"\n`);
    } catch (error) {
      console.error(
        `  ❌ Failed to generate ${subjectId} lesson for grade ${grade}:`,
        error
      );
      process.exit(1);
    }
  }

  console.log(
    "🎉 Cache warming complete! Demo lessons are cached and ready.\n"
  );
  console.log("🔧 Next steps:");
  console.log("   1. Add valid ANTHROPIC_API_KEY to .env file");
  console.log("   2. Replace warm-cache-demo.ts with warm-cache.ts");
  console.log("   3. Run: pnpm run warm-cache\n");
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
