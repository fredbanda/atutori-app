// prisma/seeds/ks1-math-grade2-progression.ts
// Cambridge KS1 Mathematics — Grade 2 Counting Progression
// 7 incremental lessons · Two-week arc · Playful & gamified tone
// Run: npx ts-node prisma/seeds/ks1-math-grade2-progression.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────
// OUTPUT SCHEMA — same shape as Grade 1, renderer is unchanged
// ─────────────────────────────────────────────────────────────────
const OUTPUT_SCHEMA = JSON.stringify(
  {
    title: "string — fun lesson title, max 6 words, 1 emoji allowed",
    cambridgeStage: "KS1",
    subject: "Mathematics",
    grade: 2,
    estimatedMinutes: 10,
    steps: [
      {
        type: "content",
        title: "string — punchy, max 5 words",
        content:
          "string — 2 to 3 short sentences, age-appropriate for 6-7 year olds",
        example:
          "string — vivid concrete example using emojis the child can count or see",
      },
      {
        type: "quiz",
        question: "string — clear question, emojis welcome",
        options: ["string", "string", "string", "string"],
        correctAnswer: "number — 0-indexed",
        explanation:
          "string — celebration + reason, start with Amazing! or You got it! etc.",
        hint: "string — gentle nudge shown on wrong answer",
      },
    ],
  },
  null,
  2
);

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — shared across all 7 Grade 2 counting lessons
// Knows this is a progression — references prior learning
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AMAZING, super-enthusiastic Cambridge KS1 Maths tutor for children aged 6 to 7! 🌟

Your personality:
- Playful, gamified — every lesson feels like levelling up in a game
- Use emojis generously for objects: 🍎 🐶 ⭐ 🎈 🚀 🎯 🏆
- Talk directly to the child: "Can YOU spot the pattern?" "You are getting SO good at this!"
- Short sentences only — max one idea per sentence
- Celebrate every win loudly: "AMAZING! 🎉" "You are a COUNTING SUPERSTAR! ⭐"
- On wrong answers: NEVER say incorrect or wrong — say "Ooh close! Here is a hint 💡" or "Almost! Try counting again 👆"
- Frame difficulty as levelling up: "Ready for the next level? 🎮" "This one is a CHALLENGE — are you ready? 🚀"

Grade 2 context (age 6–7):
- Learners have already mastered counting objects 1–10 (from Grade 1)
- They can read and write numbers to 20
- Now building: counting on from any number, number patterns, sequences, comparison
- Each lesson in this series builds directly on the previous one

Cambridge KS1 counting objectives for Grade 2:
- Count reliably to at least 20
- Count on and back from any given number within 20
- Say the number that is one more or one less than a given number
- Recognise, describe and extend number sequences
- Count in steps of 2 and 5
- Use language: greater than, less than, equal to, most, fewest

Output rules — STRICTLY enforced:
- Return ONLY valid JSON. Zero markdown. Zero text outside the JSON.
- steps array must have EXACTLY 6 items: 3 content then 3 quiz in that order
- estimatedMinutes must be 10
- cambridgeStage must be "KS1"
- grade must be 2
- Quiz Q1 = easy recall, Q2 = apply the concept, Q3 = stretch challenge
- Each content step uses DIFFERENT emoji sets — variety keeps it exciting`;

// ─────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// Each lesson gets a specific angle + what was learned before it
// so Claude can make explicit connections between lessons
// ─────────────────────────────────────────────────────────────────
function buildUserPrompt(
  topicAngle: string,
  priorKnowledge: string,
  challengeLevel: "foundational" | "building" | "stretch"
): string {
  const challengeInstructions = {
    foundational:
      "Keep it gentle and visual — lots of emoji objects to count. Build confidence first.",
    building:
      "Introduce a small twist on what they already know. One new idea per content step.",
    stretch:
      "Push their thinking! Include a sequence or pattern challenge. Q3 should make them think hard.",
  };

  return `Generate a Cambridge KS1 Mathematics counting lesson for Grade 2 (age 6–7).

Lesson angle: ${topicAngle}

What the learner already knows coming into this lesson:
${priorKnowledge}

Challenge level: ${challengeLevel}
Instruction: ${challengeInstructions[challengeLevel]}

Requirements:
- 3 content steps that build progressively on the angle above
- Make EXPLICIT reference to prior knowledge in step 1 to connect the dots
- 3 quiz questions: easy recall → apply → stretch challenge
- Use at least 4 different emoji types across the lesson
- Every example must contain actual emoji objects the child can count or follow on screen
- Q3 must require thinking, not just recall — a short sequence, a missing number, or a comparison

Return JSON matching this EXACT schema:
${OUTPUT_SCHEMA}`;
}

// ─────────────────────────────────────────────────────────────────
// THE 7 LESSON PROGRESSION
// version = lesson number in the sequence (1–7)
// topicFocus = human-readable label shown in admin + cache keys
// ─────────────────────────────────────────────────────────────────
const grade2Progression = [
  // ── Lesson 1: Counting groups up to 20 ─────────────────────────
  {
    version: 1,
    topicFocus: "counting-groups — count and recognise groups up to 20",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "Counting groups of objects up to 20. The child counts a collection of things and says how many there are altogether.",
      "- Can count objects 1 to 10 reliably (Grade 1)\n- Knows that the last number said = how many there are (cardinality)\n- Can read and write numerals 1–10",
      "foundational"
    ),
  },

  // ── Lesson 2: Counting on from any number ──────────────────────
  {
    version: 2,
    topicFocus: "counting-on — count on from any starting number within 20",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "Counting on from a given number — starting from 7 and counting to 12, or starting from 14 and counting to 20. The key idea: you do NOT need to start from 1 every time!",
      "- Can count objects to 20 (Lesson 1)\n- Knows number sequence to 20\n- Always started counting from 1 so far — this lesson breaks that habit",
      "foundational"
    ),
  },

  // ── Lesson 3: One more, one less ───────────────────────────────
  {
    version: 3,
    topicFocus: "more-and-less — one more and one less than any number to 20",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "One more and one less. Given any number up to 20, the child can say what comes just before (one less) and just after (one more) without counting all the way from 1.",
      "- Can count on from any starting number (Lesson 2)\n- Understands the number sequence to 20\n- Has not yet thought about numbers having neighbours",
      "building"
    ),
  },

  // ── Lesson 4: Counting backwards ───────────────────────────────
  {
    version: 4,
    topicFocus: "counting-back — count backwards from 20 to 0",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "Counting backwards from 20 down to 0. Frame this as a ROCKET LAUNCH countdown — 10, 9, 8, 7... BLAST OFF! 🚀 Also counting back from any given number, not just 20.",
      "- Can say one more and one less for any number (Lesson 3)\n- Counts forwards fluently to 20\n- Has not yet practised going backwards in a sequence",
      "building"
    ),
  },

  // ── Lesson 5: Missing numbers in sequences ─────────────────────
  {
    version: 5,
    topicFocus: "missing-numbers — find the missing number in a sequence",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "Finding the missing number in a short sequence. Examples: 5, 6, ?, 8 — what goes in the gap? Or: 14, 15, ?, 17. Frame these as puzzles or treasure hunts — the missing number is hiding! 🔍",
      "- Can count forwards and backwards from any number (Lessons 2 and 4)\n- Understands one more and one less (Lesson 3)\n- Now applying all of that to spot gaps in sequences",
      "building"
    ),
  },

  // ── Lesson 6: Skip counting in 2s and 5s ──────────────────────
  {
    version: 6,
    topicFocus: "skip-counting — count in steps of 2 and 5 up to 20",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "Counting in steps of 2 (2, 4, 6, 8...) and steps of 5 (5, 10, 15, 20). Show how this is like jumping — you skip over numbers! 🦘 Counting socks in pairs (2s) or fingers on hands (5s) makes it concrete.",
      "- Can identify missing numbers in sequences (Lesson 5)\n- Counts forwards and backwards fluently\n- Has only counted in steps of 1 so far — this introduces a bigger jump",
      "stretch"
    ),
  },

  // ── Lesson 7: Order and compare numbers ────────────────────────
  {
    version: 7,
    topicFocus:
      "order-and-compare — order numbers and compare using greater/less than",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "Ordering a set of numbers from smallest to biggest (and biggest to smallest). Comparing two numbers using 'greater than', 'less than', and 'equal to'. Introduce the hungry crocodile mouth metaphor for > and < — the crocodile always eats the BIGGER number! 🐊",
      "- Can count in 2s and 5s (Lesson 6)\n- Understands the full number sequence to 20\n- Can find one more and one less\n- Now putting all number knowledge together to compare and order",
      "stretch"
    ),
  },
];

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(
    "🌱 Seeding Grade 2 KS1 Maths — Counting Progression (7 lessons)...\n"
  );

  for (const lesson of grade2Progression) {
    const record = {
      subjectId: "math",
      subjectName: "Mathematics",
      cambridgeStage: "KS1",
      grade: 2,
      isActive: true,
      contentSteps: 3,
      quizCount: 3,
      systemPrompt: SYSTEM_PROMPT,
      outputSchema: OUTPUT_SCHEMA,
      ...lesson,
    };

    const result = await prisma.subjectPrompt.upsert({
      where: {
        subjectId_grade_version: {
          subjectId: record.subjectId,
          grade: record.grade,
          version: record.version,
        },
      },
      update: record,
      create: record,
    });

    const weekLabel = result.version <= 4 ? "Week 1" : "Week 2";
    console.log(
      `  ✅ v${result.version} · ${weekLabel} · "${result.topicFocus}"`
    );
    console.log(`     Difficulty: ${result.difficultyHint}\n`);
  }

  console.log("✨ Done! 7 Grade 2 counting lessons seeded.\n");
  console.log("📋 Lesson sequence:");
  grade2Progression.forEach((l) => {
    console.log(
      `   v${l.version} → lesson:2:math:${l.topicFocus.split(" — ")[0]}`
    );
  });
  console.log(
    "\n➡️  Next: update generateLesson() to accept a lessonVersion param"
  );
  console.log("   so the app serves v1 first, then v2, then v3... in order.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
