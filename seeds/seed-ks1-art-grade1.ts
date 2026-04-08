// seeds/seed-ks1-art-grade1.ts
// Cambridge KS1 Art & Design — Grade 1 · Age 5–6
// 5 lessons · Colour → Shape → Texture → Pattern → Self-Expression
// Run: pnpm db:seed-art

import dotenv from "dotenv";
dotenv.config({ override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────
// OUTPUT SCHEMA
// Same 6-step structure (3 content + 3 quiz) as math and english.
// Art-specific fields: colourPalette, activityPrompt on content steps.
// ─────────────────────────────────────────────────────────────────
const OUTPUT_SCHEMA = JSON.stringify(
  {
    title: "string — fun lesson title, max 6 words, 1 emoji allowed",
    cambridgeStage: "KS1",
    subject: "Art & Design",
    grade: 1,
    estimatedMinutes: 10,
    steps: [
      {
        type: "content",
        title: "string — short punchy title, max 5 words",
        content: "string — 2 to 3 simple sentences for age 5–6. Warm, visual, encouraging.",
        example: "string — vivid real-world example with emojis",
        activityPrompt: "string — a simple hands-on thing the child can do right now e.g. 'Point to something RED in the room!'",
        voiceScript: "string — what TTS speaks aloud. Warm, slow, encouraging. Written for listening. Use '...' for natural pauses. Never mention emoji names.",
        repeatAfterMe: [
          "string — first colour, shape or art word the child echoes",
          "string — second (max 4 items)",
        ],
      },
      {
        type: "quiz",
        question: "string — visual question, use emojis where possible",
        options: ["string", "string", "string", "string"],
        correctAnswer: "number — 0-indexed",
        explanation: "string — celebration + reason. Start with Amazing! or You got it! etc.",
        hint: "string — gentle nudge on wrong answer",
        voicePrompt: "string — what TTS says to introduce this question. Warm and direct.",
        listenFor: ["string — accepted spoken answer e.g. 'red', 'the colour red'"],
        voiceExplanation: "string — spoken celebration, warmer and slower than display text.",
      },
    ],
  },
  null,
  2
);

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a warm, creative Cambridge KS1 Art & Design tutor for children aged 5 to 6! 🎨✨

Your personality:
- Enthusiastic and encouraging — every creative attempt is celebrated!
- Use emojis freely to make art concepts visual: 🔴 for red, 🌈 for rainbow, 🖌️ for painting
- Talk directly to the child: "Can YOU spot that colour?" "What do YOU see?"
- Short, clear sentences — one idea at a time
- Celebrate creativity: "Brilliant! 🌟" "What a great eye! ⭐" "You are a real artist! 🎨"
- On wrong answers: "Ooh close! Look again... 👀" — never say wrong or incorrect

Cambridge KS1 Art & Design objectives (Grade 1, age 5–6):
- Use a range of materials to create art (paint, pencil, collage, clay)
- Use drawing, painting and sculpture to develop ideas
- Develop a wide range of art and design techniques using colour, pattern, texture, line, shape, form and space
- Learn about the work of a range of artists, craft makers and designers
- Describe differences and similarities between different practices and disciplines

Output rules — STRICTLY enforced:
- Return ONLY valid JSON. Zero markdown fences. Zero text outside the JSON.
- steps must have EXACTLY 6 items: 3 content then 3 quiz in that order
- estimatedMinutes must be 10, cambridgeStage must be "KS1", grade must be 1
- activityPrompt on every content step — something the child can do immediately without art supplies
- voiceScript on every content step — written for speaking, warm and slow, with '...' pauses
- repeatAfterMe on every content step — 2 to 4 art words or colour names the child echoes
- voicePrompt on every quiz step — introduces the question warmly
- listenFor on every quiz step — at least 2 accepted spoken answer variations
- voiceExplanation on every quiz step — spoken celebration, warmer than display text
- Quiz Q1 = easy recognition, Q2 = apply the concept, Q3 = gentle creative thinking stretch
- Use emojis generously in questions and examples so the child can see what is being described`;

// ─────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────
function buildUserPrompt(
  topic: string,
  angle: string,
  priorKnowledge: string,
  difficulty: "foundational" | "building" | "stretch",
  artistFocus?: string
): string {
  const difficultyInstructions = {
    foundational: "Very gentle introduction. Lots of repetition and encouragement. Build pure confidence and joy in art.",
    building: "One new idea layered onto what they know. Make explicit links to prior art concepts.",
    stretch: "Combine two concepts. Q3 should require creative thinking — no single right answer, celebrate all responses.",
  };

  return `Generate a Cambridge KS1 Art & Design lesson for Grade 1 (age 5–6).

Topic: ${topic}
Lesson angle: ${angle}

Prior knowledge:
${priorKnowledge}

Difficulty: ${difficulty}
Instruction: ${difficultyInstructions[difficulty]}

${artistFocus ? `Artist focus: Introduce ${artistFocus} briefly in one content step — name, one fun fact, one famous work described simply.` : ""}

Activity prompts must be screen-friendly — no art supplies needed:
- "Point to something [colour] in the room!"
- "Draw a [shape] in the air with your finger!"
- "Tap the screen where you see [texture/pattern]!"
- "Close your eyes and imagine [scene] — what colours do you see?"

Return JSON matching the EXACT schema. No extra fields. No missing fields. No markdown.
${OUTPUT_SCHEMA}`;
}

// ─────────────────────────────────────────────────────────────────
// THE 5 LESSON PROGRESSION
// ─────────────────────────────────────────────────────────────────
const grade1ArtLessons = [

  // ── v1 · COLOUR · Primary colours ──────────────────────────────
  {
    version: 1,
    topicFocus: "primary-colours — red, yellow, blue and what they make",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "Primary Colours",
      "Introduce the three primary colours — red 🔴, yellow 🟡, blue 🔵. Explain that these are SPECIAL colours because you cannot make them by mixing other colours. Show what happens when you mix two primaries: red + yellow = orange 🟠, blue + yellow = green 🟢, red + blue = purple 🟣.",
      "- Knows colour names from everyday life (sky is blue, grass is green)\n- Has not yet learned about primary vs secondary colours\n- This is their first formal art lesson",
      "foundational",
      "Piet Mondrian"
    ),
  },

  // ── v2 · COLOUR · Warm and cool colours ────────────────────────
  {
    version: 2,
    topicFocus: "warm-cool-colours — feelings colours give us",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "Warm and Cool Colours",
      "Warm colours (red 🔴, orange 🟠, yellow 🟡) feel like sunshine, fire and energy. Cool colours (blue 🔵, green 🟢, purple 🟣) feel like water, sky and calm. Artists choose colours on PURPOSE to make us feel things.",
      "- Knows primary colours and basic mixing (Lesson 1)\n- Has not yet thought about how colours make us feel\n- Connects colours to emotions naturally (red = angry, blue = sad in stories)",
      "building",
      "Vincent van Gogh"
    ),
  },

  // ── v3 · SHAPE · 2D shapes in art ──────────────────────────────
  {
    version: 3,
    topicFocus: "shapes-in-art — circles, squares, triangles, rectangles in artwork",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "Shapes in Art",
      "Artists use shapes to build pictures! Circles 🔵, squares ⬜, triangles 🔺 and rectangles are everywhere in art and in the world around us. A house is made of a square and a triangle. A face is a circle with smaller shapes inside. Abstract art uses ONLY shapes and colours — no people or objects.",
      "- Knows basic shape names from maths (Lesson 3 of math)\n- Knows primary and warm/cool colours (Lessons 1–2)\n- Has not yet connected shapes to art-making deliberately",
      "building",
      "Wassily Kandinsky"
    ),
  },

  // ── v4 · TEXTURE · What things feel like ───────────────────────
  {
    version: 4,
    topicFocus: "texture — rough, smooth, bumpy, soft in art and nature",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "Texture in Art",
      "Texture is how something FEELS when you touch it — or how it LOOKS like it would feel! Rough 🪨, smooth 🪞, bumpy 🐊, soft 🧸, spiky 🌵. Artists create texture with brushstrokes, collage, and different materials. Even a flat painting can LOOK textured!",
      "- Knows colours and shapes in art (Lessons 1–3)\n- Touches things every day but has not thought about texture as an art concept\n- Will connect texture to familiar objects (teddy bear = soft, tree bark = rough)",
      "building"
    ),
  },

  // ── v5 · PATTERN · Repeating patterns ──────────────────────────
  {
    version: 5,
    topicFocus: "pattern — repeating patterns in art, nature and design",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "Pattern in Art",
      "A pattern is when shapes, colours or lines REPEAT in order. Patterns are everywhere — on clothes 👗, tiles 🟦🟥, animals 🐆, flowers 🌸. Artists and designers use patterns to decorate and to create rhythm and movement in their work. The child can create a pattern using just two colours or two shapes alternating.",
      "- Knows colours, shapes and texture in art (Lessons 1–4)\n- Has seen patterns in maths (repeating sequences)\n- Now connecting pattern to visual art and design deliberately",
      "stretch",
      "William Morris"
    ),
  },
];

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding KS1 Art & Design — Grade 1 Progression (5 lessons)...\n");

  const topicLabels: Record<number, string> = {
    1: "Colour · Primary Colours",
    2: "Colour · Warm & Cool",
    3: "Shape · Shapes in Art",
    4: "Texture",
    5: "Pattern",
  };

  for (const lesson of grade1ArtLessons) {
    const record = {
      subjectId: "art",
      subjectName: "Art & Design",
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

  console.log("✨ Done! 5 KS1 Art & Design Grade 1 lessons seeded.\n");
  console.log("📋 Lesson sequence:");
  grade1ArtLessons.forEach((l) => {
    const slug = l.topicFocus.split(" — ")[0];
    console.log(`   v${l.version} → lesson:1:art:v${l.version}:${slug}`);
  });
  console.log("\n➡️  Next steps:");
  console.log("   pnpm db:verify   — confirm all subjects pass generation");
  console.log("   pnpm warm-cache  — pre-generate into Redis");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
