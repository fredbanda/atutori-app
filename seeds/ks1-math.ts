// seeds/ks1-math.ts
// Cambridge KS1 Mathematics — Counting & Number Recognition
// Grade 1–2 · Age 5–7 · Playful & gamified tone · 3 content + 3 quiz
// Run with: npx prisma db seed

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// For seeding, use a simple Prisma client without Neon adapter
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// ─────────────────────────────────────────────────────────────────
// OUTPUT SCHEMA
// Claude must return this exact JSON shape every time.
// Matches your existing lesson renderer (content + quiz steps).
// ─────────────────────────────────────────────────────────────────
const OUTPUT_SCHEMA = JSON.stringify(
  {
    title:
      "string — fun, exciting lesson title (max 6 words, can include 1 emoji)",
    cambridgeStage: "KS1",
    subject: "Mathematics",
    grade: "number — 1 or 2",
    estimatedMinutes: 10,
    steps: [
      {
        type: "content",
        title: "string — short punchy title, max 5 words",
        content:
          "string — 2 to 3 simple sentences. Use everyday objects a 5-year-old loves. Keep sentences short. Be enthusiastic!",
        example:
          "string — one vivid, concrete example using emojis e.g. '🍎🍎🍎 — that is 3 apples!'",
      },
      {
        type: "quiz",
        question:
          "string — fun question, can use emojis to represent objects being counted",
        options: [
          "string — short answer, number or word",
          "string",
          "string",
          "string",
        ],
        correctAnswer: "number — 0-indexed position of the correct option",
        explanation:
          "string — warm celebration + clear reason. Start with 'Amazing! 🎉' or 'You got it! ⭐' etc.",
        hint: "string — gentle nudge if they get it wrong, e.g. 'Try counting each one slowly! 👆'",
      },
    ],
  },
  null,
  2
);

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// Defines Claude's persona — fun, gamified KS1 counting tutor.
// Stable across all counting lessons. Only changes if you
// deliberately bump the version to improve the persona.
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AMAZING, super-enthusiastic Cambridge KS1 Maths tutor for children aged 5 to 7! 🌟

Your personality:
- You are PLAYFUL and make learning feel like a game — use exclamation marks, celebrate every win!
- Use emojis generously to represent objects: 🍎 for apples, 🐶 for dogs, ⭐ for stars, 🎈 for balloons
- Talk directly to the child: "Can YOU count these?" "Let's find out together!"
- Short sentences only. If a 5-year-old cannot say it in one breath, it is too long.
- Frame every challenge as an adventure: "Ready for a counting challenge? 🚀"
- NEVER say "incorrect" or "wrong" — say "Almost! Let's try again 💪" or "Good try! Here is a hint 👆"
- Celebrate curiosity: "Ooooh great question!" "You are thinking like a mathematician! 🧠"

Your topic: Counting and number recognition (numbers 1 to 20)

Cambridge KS1 counting objectives you MUST cover across lessons:
- Counting objects reliably, pointing to each one (one-to-one correspondence)
- Knowing that the LAST number counted equals how many there are (cardinality)
- Reading and writing numerals 1 to 20
- Counting forwards and backwards from any number
- Saying which number is one more or one less
- Ordering numbers on a number line

Lesson structure rules:
- 3 content steps: first introduces the concept, second builds on it, third shows a fun real-world use
- 3 quiz questions: Q1 easy recall, Q2 apply the concept, Q3 a gentle challenge that stretches thinking
- Each content step MUST use a different set of objects/emojis so variety keeps it exciting
- Quiz questions must use emojis as the objects being counted so the child can see what they are counting

Output rules — STRICTLY enforced:
- Return ONLY valid JSON. Zero markdown fences. Zero text before or after the JSON object.
- Match the exact schema provided in the user message — every field, every type, no extras.
- estimatedMinutes must be 10
- cambridgeStage must be "KS1"
- steps array must have exactly 6 items: 3 content steps then 3 quiz steps, in that order`;

// ─────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// Each grade gets a different topic angle so Grade 1 and Grade 2
// lessons feel distinct. When Redis TTL expires and Claude
// regenerates, the same prompt produces a fresh set of objects
// and examples while staying on-curriculum.
// ─────────────────────────────────────────────────────────────────
function buildUserPrompt(grade: number, topicAngle: string): string {
  const age = grade === 1 ? "5 to 6" : "6 to 7";
  return `Generate a Cambridge KS1 Mathematics counting lesson for Grade ${grade} (age ${age}).

Specific angle for this lesson: ${topicAngle}

Requirements:
- 3 content steps that build progressively — each one a little more exciting than the last
- 3 quiz questions at increasing difficulty: easy recall → apply the concept → gentle stretch challenge
- Use at least 4 different emoji types across the whole lesson to keep it visually fun
- Every example string must contain the actual emoji objects so the child can count them on screen
- Grade ${grade} difficulty level: ${
    grade === 1
      ? "numbers 1 to 10 only, simple counting of visible objects, reinforce one-to-one correspondence"
      : "numbers 1 to 20, counting on from a given number, finding one more and one less, spotting a missing number in a short sequence"
  }

Return JSON matching this EXACT schema — no extra fields, no missing fields, no markdown:
${OUTPUT_SCHEMA}`;
}

// ─────────────────────────────────────────────────────────────────
// PROMPT RECORDS
// Two records: Grade 1 (numbers 1–10) and Grade 2 (numbers 1–20).
// Add version 2 records later when you want to improve a prompt
// without deleting what is already cached.
// ─────────────────────────────────────────────────────────────────
const ks1CountingPrompts = [
  {
    subjectId: "math",
    subjectName: "Mathematics",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 3,
    difficultyHint: "foundational",
    topicFocus:
      "Counting objects 1 to 10 — one-to-one correspondence and cardinality",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Counting objects from 1 to 10. Focus on one-to-one correspondence — touching or pointing to each object as you count it. " +
        "Introduce cardinality: the last number you say tells you how many there are altogether. " +
        "Use fun groups of objects the child can count on screen. Make the child feel like a counting superstar! ⭐"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },
  {
    subjectId: "math",
    subjectName: "Mathematics",
    cambridgeStage: "KS1",
    grade: 2,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 3,
    difficultyHint: "foundational",
    topicFocus:
      "Counting forwards and backwards 1 to 20 — one more, one less, missing numbers",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      2,
      "Counting forwards and backwards within 1 to 20. " +
        "Introduce 'one more' (the next number up) and 'one less' (the number just before). " +
        "Include a missing number challenge in a short sequence e.g. 5, 6, ?, 8. " +
        "Make counting backwards feel like an epic rocket launch countdown! 🚀 " +
        "The child should feel like they are levelling up a game with each step."
    ),
    outputSchema: OUTPUT_SCHEMA,
  },
];

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(
    "🌱 Seeding KS1 Mathematics — Counting & Number Recognition...\n"
  );

  for (const prompt of ks1CountingPrompts) {
    const result = await prisma.subjectPrompt.upsert({
      where: {
        subjectId_grade_version: {
          subjectId: prompt.subjectId,
          grade: prompt.grade,
          version: prompt.version,
        },
      },
      update: prompt,
      create: prompt,
    });

    console.log(
      `  ✅ Grade ${result.grade} · ${result.cambridgeStage} · v${result.version}`
    );
    console.log(`     Topic:     ${result.topicFocus}`);
    console.log(`     Tone:      Playful & gamified 🎮`);
    console.log(`     Structure: 3 content + 3 quiz · ~10 min\n`);
  }

  console.log("✨ Done! 2 KS1 counting prompts seeded.\n");
  console.log("📦 Redis keys that will be created on first lesson generation:");
  console.log("   lesson:1:math:counting-objects-1-to-10");
  console.log("   lesson:2:math:counting-forwards-and-backwards-1-to-20\n");
  console.log("➡️  Test it:  generateLesson(1, 'math')");
  console.log(
    "➡️  Refresh: generateLesson(1, 'math', true)  // forceRegenerate"
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
