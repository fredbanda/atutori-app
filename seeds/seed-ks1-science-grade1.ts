// seeds/seed-ks1-science-grade1.ts
// Cambridge KS1 Science (Discovery) — Grade 1 · Age 5–6
// 6 lessons · Living Things (v1–v2) → Materials (v3–v4) → Seasonal Changes & Forces (v5–v6)
// Explorer theme — "You are a scientist today!"
// Run: pnpm db:seed-science

import dotenv from "dotenv";
dotenv.config({ override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────
// OUTPUT SCHEMA
// Same 6-step structure (3 content + 3 quiz).
// Science-specific: activityPrompt (observation the child does now)
// and scienceFact (one wow fact per content step).
// ─────────────────────────────────────────────────────────────────
const OUTPUT_SCHEMA = JSON.stringify(
  {
    title: "string — exciting lesson title, max 6 words, 1 emoji allowed",
    cambridgeStage: "KS1",
    subject: "Science",
    grade: 1,
    estimatedMinutes: 10,
    steps: [
      {
        type: "content",
        title: "string — short punchy title, max 5 words",
        content: "string — 2 to 3 simple sentences for age 5–6. Curious, wonder-filled, encouraging.",
        example: "string — vivid real-world example with emojis",
        activityPrompt: "string — a simple observation the child can do RIGHT NOW e.g. 'Look out the window — can you spot something alive?'",
        scienceFact: "string — one WOW fact that will make the child say 'Whoa!' Keep it short and mind-blowing.",
        voiceScript: "string — what TTS speaks aloud. Curious, wonder-filled, slow. Use '...' for natural pauses. Never mention emoji names.",
        repeatAfterMe: [
          "string — first science word or phrase the child echoes",
          "string — second (max 4 items)",
        ],
      },
      {
        type: "quiz",
        question: "string — curious question, use emojis where possible",
        options: ["string", "string", "string", "string"],
        correctAnswer: "number — 0-indexed",
        explanation: "string — celebration + science reason. Start with Amazing! or You got it! etc.",
        hint: "string — gentle scientific nudge on wrong answer",
        voicePrompt: "string — what TTS says to introduce this question. Curious and encouraging.",
        listenFor: ["string — accepted spoken answer e.g. 'alive', 'it is alive', 'living'"],
        voiceExplanation: "string — spoken celebration with science wonder, warmer than display text.",
      },
    ],
  },
  null,
  2
);

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AMAZING Cambridge KS1 Science explorer guide for children aged 5 to 6! 🔬🌍✨

Your personality:
- You are a fellow explorer — "WE are scientists today! Let's discover together!"
- Express genuine wonder: "Whoa! Did you know...?" "That is SO cool!" "Scientists LOVE questions like that!"
- Use emojis to make science visual: 🌱 plants, 🐛 animals, 💧 water, 🌞 sun, 🪨 rocks
- Talk directly to the child: "Can YOU spot...?" "What do YOU think will happen?"
- Short, clear sentences — one discovery at a time
- Celebrate curiosity above correct answers: "What a brilliant question! 🧠"
- On wrong answers: "Ooh interesting idea! Let's investigate... 🔍" — never say wrong or incorrect
- Frame everything as an investigation: "Let's find out!", "Time to investigate!", "Scientists ask WHY!"

Cambridge KS1 Science objectives (Grade 1, age 5–6):

LIVING THINGS & THEIR HABITATS:
- Explore and compare differences between living, dead and never-alive things
- Identify that most living things live in habitats suited to their needs
- Describe how different habitats provide basic needs (food, water, shelter)
- Identify and name plants and animals in different habitats
- Describe simple food chains

EVERYDAY MATERIALS:
- Distinguish between objects and the materials they are made from
- Identify and name everyday materials: wood, plastic, glass, metal, water, rock
- Describe properties: hard/soft, stretchy/stiff, shiny/dull, rough/smooth, transparent/opaque
- Compare suitability of materials for different purposes

SEASONAL CHANGES & FORCES:
- Observe changes across the four seasons
- Observe and describe weather associated with seasons
- Describe how day length varies
- Identify pushes and pulls as forces
- Observe how forces make things move, stop or change direction

Output rules — STRICTLY enforced:
- Return ONLY valid JSON. Zero markdown fences. Zero text outside the JSON.
- steps must have EXACTLY 6 items: 3 content then 3 quiz in that order
- estimatedMinutes must be 10, cambridgeStage must be "KS1", grade must be 1
- activityPrompt on every content step — a real observation the child can do at their screen or window
- scienceFact on every content step — one genuinely surprising fact, age-appropriate
- voiceScript on every content step — written for speaking, curious and slow, with '...' pauses
- repeatAfterMe on every content step — 2 to 4 science words the child echoes back
- voicePrompt on every quiz step — introduces the question with scientific curiosity
- listenFor on every quiz step — at least 2 accepted spoken answer variations
- voiceExplanation on every quiz step — spoken wonder + celebration, warmer than display text
- Quiz Q1 = easy recall, Q2 = apply the concept, Q3 = gentle scientific thinking stretch
- Use emojis generously so the child can visualise what is being described`;

// ─────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────
function buildUserPrompt(
  strand: "living-things" | "materials" | "seasonal-forces",
  topic: string,
  angle: string,
  priorKnowledge: string,
  difficulty: "foundational" | "building" | "stretch",
  scientistFocus?: string
): string {
  const difficultyInstructions = {
    foundational: "Very gentle introduction. Build wonder and curiosity first. Every new idea gets a real-world example the child has already seen.",
    building: "One new scientific idea layered onto what they know. Make explicit links to prior discoveries.",
    stretch: "Connect two concepts. Q3 should require the child to think like a scientist — predict, reason, or compare.",
  };

  const strandContext = {
    "living-things": "STRAND: Living Things & Their Habitats — focus on what makes something alive, where animals and plants live, and what they need to survive.",
    "materials": "STRAND: Everyday Materials — focus on what objects are made from, naming materials, and describing their properties.",
    "seasonal-forces": "STRAND: Seasonal Changes & Forces — focus on how the world changes through seasons and how pushes and pulls make things move.",
  };

  return `Generate a Cambridge KS1 Science lesson for Grade 1 (age 5–6).

${strandContext[strand]}
Topic: ${topic}
Lesson angle: ${angle}

Prior knowledge:
${priorKnowledge}

Difficulty: ${difficulty}
Instruction: ${difficultyInstructions[difficulty]}

${scientistFocus ? `Scientist spotlight: Briefly introduce ${scientistFocus} in one content step — their name, one child-friendly fun fact about them, and one discovery they made. Frame them as a real explorer just like the child.` : ""}

Activity prompts must be doable RIGHT NOW at the screen or window — no equipment needed:
- "Look around the room — can you find something made of [material]?"
- "Look out the window — what season clues can you spot?"
- "Push your hand against the table. Can you feel the push back? That is a FORCE!"
- "Find something alive and something never-alive near you!"
- "Touch something smooth and something rough near you!"

Science facts must be genuinely surprising and age-appropriate:
- Short — one sentence maximum
- Wow-factor — something the child will want to tell their parents
- Accurate — real science, simplified

Return JSON matching the EXACT schema. No extra fields. No missing fields. No markdown.
${OUTPUT_SCHEMA}`;
}

// ─────────────────────────────────────────────────────────────────
// THE 6 LESSON PROGRESSION
// ─────────────────────────────────────────────────────────────────
const grade1ScienceLessons = [

  // ── v1 · LIVING THINGS · Alive, dead, never-alive ──────────────
  {
    version: 1,
    topicFocus: "living-things — alive, dead and never-alive: what makes something living",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "living-things",
      "What Makes Something Alive?",
      "The seven signs of life: Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition (MRSGREN — but keep it simple for age 5–6, focus on: it grows, it eats/drinks, it moves by itself, it has babies). Contrast: a rock 🪨 was never alive. A fallen leaf 🍂 was once alive but is now dead. A dog 🐕 is alive right now.",
      "- Knows names of common animals and plants\n- Has not yet thought scientifically about what 'alive' means\n- May think fire or clouds are alive because they move",
      "foundational",
      "Jane Goodall"
    ),
  },

  // ── v2 · LIVING THINGS · Habitats ──────────────────────────────
  {
    version: 2,
    topicFocus: "habitats — where animals and plants live and why",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "living-things",
      "Habitats — Home Sweet Home",
      "A habitat is the natural home of a living thing. It provides everything the animal or plant needs: food 🍃, water 💧, shelter 🏠, and safety. Different habitats: ocean 🌊 (fish, dolphins), forest 🌲 (foxes, owls), desert 🏜️ (camels, lizards), garden 🌻 (worms, bees). Animals are perfectly suited to their habitat — a fish cannot live in a desert!",
      "- Knows what makes something alive (Lesson 1)\n- Knows names of common animals and where they live from stories\n- Has not yet thought about WHY animals live where they do",
      "building",
      "David Attenborough"
    ),
  },

  // ── v3 · MATERIALS · Objects and materials ─────────────────────
  {
    version: 3,
    topicFocus: "materials — objects vs materials: wood, plastic, metal, glass, rock, fabric",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "materials",
      "What Is It Made Of?",
      "An OBJECT is the thing (a chair, a bottle, a window). A MATERIAL is what it is made FROM (wood, plastic, glass). The same object can be made from different materials — a bottle can be plastic or glass. Key materials to name: wood 🪵, plastic, metal 🔩, glass, rock 🪨, fabric 🧵, water 💧.",
      "- Knows names of everyday objects\n- Has not yet distinguished between an object and its material\n- This is their first materials lesson",
      "foundational"
    ),
  },

  // ── v4 · MATERIALS · Properties ────────────────────────────────
  {
    version: 4,
    topicFocus: "material-properties — hard/soft, rough/smooth, transparent/opaque, flexible/rigid",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "materials",
      "What Can Materials Do?",
      "Materials have PROPERTIES — words that describe what they are like and what they can do. Hard 🪨 vs soft 🧸. Rough vs smooth. Transparent (you can see through it) 🪟 vs opaque (you cannot) 🧱. Flexible (bends) vs rigid (does not bend). We choose materials BECAUSE of their properties — windows are glass because glass is transparent!",
      "- Can name common materials (Lesson 3)\n- Has not yet used scientific vocabulary for properties\n- Touches and uses materials every day without thinking about their properties",
      "building"
    ),
  },

  // ── v5 · SEASONAL CHANGES · The four seasons ───────────────────
  {
    version: 5,
    topicFocus: "seasons — four seasons, weather changes, day length, nature clues",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "seasonal-forces",
      "The Four Seasons",
      "Earth has four seasons because it tilts as it travels around the Sun ☀️. Spring 🌸 (warm, flowers bloom, baby animals born). Summer ☀️ (hot, long days, leaves green). Autumn 🍂 (cool, leaves change colour and fall, harvest). Winter ❄️ (cold, short days, some animals hibernate). Each season has different weather, different plants, different animal behaviours.",
      "- Knows weather words (sunny, rainy, snowy, windy)\n- Has experienced seasons but not thought about WHY they happen\n- Connects seasons to clothing and activities from daily life",
      "building"
    ),
  },

  // ── v6 · FORCES · Push and pull ────────────────────────────────
  {
    version: 6,
    topicFocus: "forces — push and pull forces make things move, stop and change direction",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "seasonal-forces",
      "Push and Pull — Forces Are Everywhere!",
      "A FORCE is a push or a pull. Forces make things START moving, STOP moving, SPEED UP, SLOW DOWN, or CHANGE DIRECTION. Push: kicking a ball ⚽, closing a door 🚪, pressing a button. Pull: opening a drawer, picking up a bag 🎒, a magnet 🧲 pulling metal. Gravity is a special pulling force that pulls EVERYTHING down towards Earth — that is why things fall!",
      "- Knows seasons and weather (Lesson 5)\n- Has pushed and pulled things every day without thinking about forces\n- This is their first introduction to forces as a scientific concept",
      "stretch",
      "Isaac Newton"
    ),
  },
];

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding KS1 Science (Discovery) — Grade 1 Progression (6 lessons)...\n");

  const topicLabels: Record<number, string> = {
    1: "Living Things · Alive vs Dead",
    2: "Living Things · Habitats",
    3: "Materials · Objects & Materials",
    4: "Materials · Properties",
    5: "Seasonal Changes · Four Seasons",
    6: "Forces · Push & Pull",
  };

  for (const lesson of grade1ScienceLessons) {
    const record = {
      subjectId: "science",
      subjectName: "Science",
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

  console.log("✨ Done! 6 KS1 Science Grade 1 lessons seeded.\n");
  console.log("📋 Lesson sequence:");
  grade1ScienceLessons.forEach((l) => {
    const slug = l.topicFocus.split(" — ")[0];
    console.log(`   v${l.version} → lesson:1:science:v${l.version}:${slug}`);
  });
  console.log("\n🔬 Strands covered:");
  console.log("   v1–v2 · Living Things & Their Habitats");
  console.log("   v3–v4 · Everyday Materials");
  console.log("   v5–v6 · Seasonal Changes & Forces");
  console.log("\n➡️  Next steps:");
  console.log("   pnpm db:seed-science  — run this seed");
  console.log("   pnpm db:verify        — confirm all subjects pass generation");
  console.log("   pnpm warm-cache       — pre-generate into Redis");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
