// seeds/seed-ks1-puzzles-grade1.ts
// Cambridge KS1 Computing (Puzzles) — Grade 1 · Age 5–6
// 6 lessons · Algorithms (v1–v2) → Patterns (v3–v4) → Decomposition (v5–v6)
// Programmer theme — "You are a programmer today!"
// Run: pnpm db:seed-puzzles

import dotenv from "dotenv";
dotenv.config({ override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────
// OUTPUT SCHEMA
// ─────────────────────────────────────────────────────────────────
const OUTPUT_SCHEMA = JSON.stringify(
  {
    title: "string — exciting lesson title, max 6 words, 1 emoji allowed",
    cambridgeStage: "KS1",
    subject: "Computing",
    grade: 1,
    estimatedMinutes: 10,
    steps: [
      {
        type: "content",
        title: "string — short punchy title, max 5 words",
        content: "string — 2 to 3 simple sentences for age 5–6. Curious, playful, empowering.",
        example: "string — vivid real-world example with emojis",
        activityPrompt: "string — an unplugged activity the child does RIGHT NOW e.g. 'Give your teddy bear 3 instructions to reach the door!'",
        codingFact: "string — one WOW fact about computers, coding or the featured programmer. Short and mind-blowing.",
        voiceScript: "string — what TTS speaks aloud. Playful, logical, slow. Use '...' for pauses where child thinks or acts.",
        repeatAfterMe: [
          "string — first computing word or instruction the child echoes e.g. 'algorithm'",
          "string — second (max 4 items)",
        ],
      },
      {
        type: "quiz",
        question: "string — fun computational thinking question, use emojis where possible",
        options: ["string", "string", "string", "string"],
        correctAnswer: "number — 0-indexed",
        explanation: "string — celebration + computing reason. Start with Amazing! or You got it! etc.",
        hint: "string — gentle logical nudge on wrong answer",
        voicePrompt: "string — what TTS says to introduce this question. Logical and encouraging.",
        listenFor: ["string — accepted spoken answer e.g. 'algorithm', 'an algorithm', 'instructions'"],
        voiceExplanation: "string — spoken logical celebration, warmer than display text.",
      },
    ],
  },
  null,
  2
);

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AMAZING Cambridge KS1 Computing teacher for children aged 5 to 6! 💻🤖✨

Your personality:
- You are a fellow programmer — "WE are programmers today! Let's think like computers!"
- Express excitement about logic: "Ooh great thinking! 🧠" "Computers LOVE clear instructions!" "You just programmed that!"
- Use emojis to make computing visual: 🤖 robots, 💻 computers, 🎮 games, 🔢 numbers, ➡️ arrows for directions
- Talk directly to the child: "Can YOU write those instructions?" "What happens if we change the order?"
- Short, clear sentences — one computational idea at a time
- Celebrate logical thinking above correct answers: "What a brilliant programmer brain! 🧠"
- On wrong answers: "Ooh close! Let's debug that... 🔍" — never say wrong or incorrect
- Frame everything as programming: "Let's code it!", "Time to debug!", "Programmers ask WHAT IF!"

Cambridge KS1 Computing objectives (Grade 1, age 5–6):

ALGORITHMS:
- Understand what algorithms are and how they are implemented as programs
- Create and debug simple programs
- Understand that programs execute by following precise and unambiguous instructions
- Use logical reasoning to predict the behaviour of simple programs

PATTERNS & ABSTRACTION:
- Identify, create and describe patterns in sequences
- Recognise that patterns can be used to solve problems more efficiently
- Understand that computers find and use patterns to work faster

DECOMPOSITION:
- Break problems into smaller, manageable parts
- Understand that complex tasks are made of simpler steps
- Sequence instructions correctly to achieve a goal
- Identify what is missing or wrong in a sequence (debugging)

Output rules — STRICTLY enforced:
- Return ONLY valid JSON. Zero markdown fences. Zero text outside the JSON.
- steps must have EXACTLY 6 items: 3 content then 3 quiz in that order
- estimatedMinutes must be 10, cambridgeStage must be "KS1", grade must be 1
- activityPrompt on every content step — unplugged, no computer needed, physical or imaginative
- codingFact on every content step — one genuinely surprising computing fact, age-appropriate
- voiceScript on every content step — written for speaking, playful and logical, with '...' pauses to think
- repeatAfterMe on every content step — 2 to 4 computing words or short instructions the child echoes
- voicePrompt on every quiz step — introduces the question with logical curiosity
- listenFor on every quiz step — at least 2 accepted spoken answer variations
- voiceExplanation on every quiz step — spoken logical celebration, warmer than display text
- Quiz Q1 = easy recall, Q2 = apply the concept, Q3 = gentle logical thinking stretch
- Use emojis generously — arrows ➡️⬆️⬇️⬅️ for directions, 🤖 for robots, ✅ for correct steps`;

// ─────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────
function buildUserPrompt(
  strand: "algorithms" | "patterns" | "decomposition",
  topic: string,
  angle: string,
  priorKnowledge: string,
  difficulty: "foundational" | "building" | "stretch",
  programmerFocus?: string
): string {
  const difficultyInstructions = {
    foundational: "Very gentle introduction. Use physical, real-world analogies the child already knows. Build confidence that they can already think like a programmer.",
    building: "One new computing idea layered onto what they know. Make explicit links to prior lessons. Introduce simple logical vocabulary.",
    stretch: "Connect two computing concepts. Q3 should require the child to think logically — predict an outcome, spot a bug, or complete a sequence.",
  };

  const strandContext = {
    algorithms: "STRAND: Algorithms — focus on giving clear step-by-step instructions in the correct order, and understanding that computers follow instructions exactly.",
    patterns: "STRAND: Patterns & Abstraction — focus on spotting, describing and creating repeating patterns, and understanding why patterns are useful.",
    decomposition: "STRAND: Decomposition — focus on breaking a big task into smaller steps, sequencing those steps correctly, and spotting what is missing or wrong.",
  };

  return `Generate a Cambridge KS1 Computing lesson for Grade 1 (age 5–6).

${strandContext[strand]}
Topic: ${topic}
Lesson angle: ${angle}

Prior knowledge:
${priorKnowledge}

Difficulty: ${difficulty}
Instruction: ${difficultyInstructions[difficulty]}

${programmerFocus ? `Programmer spotlight: Briefly introduce ${programmerFocus} in one content step — their name, one child-friendly fun fact, and one thing they created or discovered. Frame them as a real programmer just like the child.` : ""}

Activity prompts must be UNPLUGGED — no computer or device needed:
- "Give your toy 3 instructions to get from the bed to the door — say them out loud!"
- "Clap the pattern: CLAP clap clap CLAP clap clap — what comes next?"
- "Draw the steps to make a sandwich — what order do they go in?"
- "Be a robot! Ask a grown-up to follow your instructions EXACTLY — no guessing!"
- "Spot the mistake: Forward, Forward, Turn LEFT, Forward, Turn LEFT — where is the bug?"
- "Break 'get ready for school' into 5 tiny steps — what are they?"

Coding facts must be genuinely surprising and age-appropriate:
- Short — one sentence maximum
- Wow-factor — something the child will want to share
- Accurate — real computing knowledge, simplified

Return JSON matching the EXACT schema. No extra fields. No missing fields. No markdown.
${OUTPUT_SCHEMA}`;
}

// ─────────────────────────────────────────────────────────────────
// THE 6 LESSON PROGRESSION
// ─────────────────────────────────────────────────────────────────
const grade1PuzzlesLessons = [

  // ── v1 · ALGORITHMS · What is an algorithm? ────────────────────
  {
    version: 1,
    topicFocus: "algorithms — step-by-step instructions in the right order",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "algorithms",
      "What is an Algorithm?",
      "An ALGORITHM is a set of step-by-step instructions that solves a problem. Computers follow algorithms EXACTLY — they cannot guess or skip steps! Real-life algorithms: a recipe 🍳 (step 1: crack the egg, step 2: mix it, step 3: cook it), getting dressed 👕 (underwear BEFORE trousers!), brushing teeth 🪥. The ORDER matters — if you put your shoes on before your socks, something goes wrong!",
      "- Follows instructions at home and school every day\n- Has not yet thought about instructions as a computing concept\n- This is their very first computing lesson",
      "foundational",
      "Ada Lovelace"
    ),
  },

  // ── v2 · ALGORITHMS · Debugging ────────────────────────────────
  {
    version: 2,
    topicFocus: "debugging — finding and fixing mistakes in instructions",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "algorithms",
      "Debugging — Fix the Bug!",
      "A BUG is a mistake in an algorithm that makes it go wrong. DEBUGGING means finding and fixing the bug. Even the best programmers make bugs — debugging is a superpower! 🦸 Types of bugs: wrong order (socks after shoes 🧦👟), missing step (forgot to add water to the recipe 💧), wrong instruction (turn RIGHT instead of LEFT ➡️). Real programmers spend lots of time debugging — it is totally normal!",
      "- Knows what an algorithm is and why order matters (Lesson 1)\n- Has made mistakes and fixed them in everyday life\n- Has not yet thought about mistakes in instructions as 'bugs'",
      "building",
      "Grace Hopper"
    ),
  },

  // ── v3 · PATTERNS · Spotting patterns ──────────────────────────
  {
    version: 3,
    topicFocus: "spotting-patterns — recognising and continuing repeating sequences",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "patterns",
      "Spot the Pattern!",
      "A PATTERN is something that repeats in a predictable order. Patterns are EVERYWHERE: on clothes 👕, in music 🎵, in nature 🌸, in numbers 1 2 3 1 2 3. Computers are AMAZING at finding patterns — that is how your tablet knows what song you like next! Pattern types: colour patterns (🔴🔵🔴🔵), shape patterns (⭐🔺⭐🔺), number patterns (1 2 1 2), action patterns (clap tap clap tap).",
      "- Has seen patterns in art (Lesson 4 of Art) and maths\n- Has not yet thought about patterns as a computing concept\n- This is their first patterns lesson in computing",
      "foundational"
    ),
  },

  // ── v4 · PATTERNS · Creating and using patterns ────────────────
  {
    version: 4,
    topicFocus: "creating-patterns — making patterns and using them to solve problems faster",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "patterns",
      "Make a Pattern, Solve a Problem!",
      "Programmers USE patterns to solve problems faster — instead of writing the same instruction 100 times, they find the pattern and REPEAT it. This is called a LOOP in coding! 🔄 Example: to draw a square, instead of 'forward, turn, forward, turn, forward, turn, forward, turn' you can say 'repeat 4 times: forward then turn'. Spotting the pattern saves time! Patterns also help us PREDICT what comes next.",
      "- Can spot and continue repeating patterns (Lesson 3)\n- Knows algorithms are step-by-step instructions (Lessons 1–2)\n- Has not yet connected patterns to making algorithms shorter and smarter",
      "building",
      "Tim Berners-Lee"
    ),
  },

  // ── v5 · DECOMPOSITION · Breaking tasks into steps ─────────────
  {
    version: 5,
    topicFocus: "decomposition — breaking big tasks into smaller manageable steps",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "decomposition",
      "Break It Down!",
      "DECOMPOSITION means breaking a big, complicated task into smaller, easier pieces. Programmers do this ALL the time — a big program is just lots of tiny programs working together! Real-life decomposition: 'Get ready for school' 🎒 breaks into → wake up → wash face → get dressed → eat breakfast → pack bag → put on shoes. Each small step is easy. Together they solve the big task!",
      "- Knows algorithms and debugging (Lessons 1–2)\n- Knows how to spot and use patterns (Lessons 3–4)\n- Has not yet formally broken a problem into parts as a computing strategy",
      "building"
    ),
  },

  // ── v6 · DECOMPOSITION · Sequencing and problem solving ─────────
  {
    version: 6,
    topicFocus: "sequencing — putting steps in the right order to solve a problem",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "decomposition",
      "Put It in Order — You Are a Programmer!",
      "A programmer's job is to take decomposed steps and put them in the PERFECT order — this is called SEQUENCING. Wrong sequence = bug! 🐛 Right sequence = working program! ✅ Challenge: here are the steps to make a jam sandwich — but they are in the wrong order! 1) Eat the sandwich 2) Put jam on bread 3) Get the bread 4) Put the two slices together. What is the correct order? Sequencing + decomposition + debugging = a complete programmer toolkit!",
      "- Can decompose tasks into steps (Lesson 5)\n- Can spot and fix bugs (Lesson 2)\n- Can use patterns to make algorithms smarter (Lesson 4)\n- This is the capstone lesson — bringing all concepts together",
      "stretch",
      "Hedy Lamarr"
    ),
  },
];

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding KS1 Computing (Puzzles) — Grade 1 Progression (6 lessons)...\n");

  const topicLabels: Record<number, string> = {
    1: "Algorithms · What is an Algorithm?",
    2: "Algorithms · Debugging",
    3: "Patterns · Spotting Patterns",
    4: "Patterns · Creating & Using Patterns",
    5: "Decomposition · Breaking Tasks Down",
    6: "Decomposition · Sequencing & Problem Solving",
  };

  for (const lesson of grade1PuzzlesLessons) {
    const record = {
      subjectId: "puzzles",
      subjectName: "Computing",
      cambridgeStage: "KS1",
      grade: 1,
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

    console.log(`  ✅ v${result.version} · ${topicLabels[result.version]}`);
    console.log(`     Topic: "${result.topicFocus}"\n`);
  }

  console.log("✨ Done! 6 KS1 Computing Grade 1 lessons seeded.\n");
  console.log("📋 Lesson sequence:");
  grade1PuzzlesLessons.forEach((l) => {
    const slug = l.topicFocus.split(" — ")[0];
    console.log(`   v${l.version} → lesson:1:puzzles:v${l.version}:${slug}`);
  });
  console.log("\n💻 Strands covered:");
  console.log("   v1–v2 · Algorithms (instructions + debugging)");
  console.log("   v3–v4 · Patterns (spotting + creating/using)");
  console.log("   v5–v6 · Decomposition (breaking down + sequencing)");
  console.log("\n👩‍💻 Programmer spotlights:");
  console.log("   v1 · Ada Lovelace — world's first programmer");
  console.log("   v2 · Grace Hopper — coined the term 'debugging'");
  console.log("   v4 · Tim Berners-Lee — invented the World Wide Web");
  console.log("   v6 · Hedy Lamarr — actress who invented WiFi technology");
  console.log("\n➡️  Next steps:");
  console.log("   pnpm db:seed-puzzles  — run this seed");
  console.log("   pnpm db:verify        — confirm all subjects pass generation");
  console.log("   pnpm warm-cache       — pre-generate into Redis");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
