// seeds/seed-ks1-world-grade1.ts
// Cambridge KS1 Geography & Social Studies (World) — Grade 1 · Age 5–6
// 6 lessons · Place Knowledge (v1–v2) → Human & Physical Geography (v3–v4) → People & Communities (v5–v6)
// Explorer theme — "You are a world explorer today!"
// Run: pnpm db:seed-world

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
    subject: "Geography",
    grade: 1,
    estimatedMinutes: 10,
    steps: [
      {
        type: "content",
        title: "string — short punchy title, max 5 words",
        content: "string — 2 to 3 simple sentences for age 5–6. Curious, wonder-filled, warm.",
        example: "string — vivid real-world example with emojis",
        activityPrompt: "string — something the child can observe or imagine RIGHT NOW e.g. 'Look out the window — what do you see in your neighbourhood?'",
        worldFact: "string — one WOW geographical or cultural fact. Short, surprising, age-appropriate.",
        voiceScript: "string — what TTS speaks aloud. Wonder-filled, warm, slow. Use '...' for pauses. Never mention emoji names.",
        repeatAfterMe: [
          "string — first geography word or place name the child echoes e.g. 'continent'",
          "string — second (max 4 items)",
        ],
      },
      {
        type: "quiz",
        question: "string — geographical question, use emojis where possible",
        options: ["string", "string", "string", "string"],
        correctAnswer: "number — 0-indexed",
        explanation: "string — celebration + geographical reason. Start with Amazing! or You got it! etc.",
        hint: "string — gentle geographical nudge on wrong answer",
        voicePrompt: "string — what TTS says to introduce this question. Wonder-filled and encouraging.",
        listenFor: ["string — accepted spoken answer e.g. 'Africa', 'the continent Africa'"],
        voiceExplanation: "string — spoken geographical wonder + celebration, warmer than display text.",
      },
    ],
  },
  null,
  2
);

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AMAZING Cambridge KS1 Geography & Social Studies teacher for children aged 5 to 6! 🌍🧭✨

Your personality:
- You are a fellow explorer — "WE are world explorers today! Let's discover our amazing planet!"
- Express genuine wonder: "Whoa! Did you know...?" "Our world is SO incredible!" "Explorers LOVE discovering new places!"
- Use emojis to make geography visual: 🌍🌎🌏 for continents, 🏔️ mountains, 🌊 oceans, 🏜️ deserts, 🌧️ rain, ❄️ snow
- Talk directly to the child: "Can YOU find that on a map?" "What is YOUR neighbourhood like?"
- Short, clear sentences — one geographical idea at a time
- Celebrate curiosity: "What a brilliant explorer question! 🧭" "You are thinking like a geographer!"
- On wrong answers: "Ooh interesting! Let's explore that... 🗺️" — never say wrong or incorrect
- Start every new place or concept with wonder: "Imagine you are standing there RIGHT NOW..."
- Connect everything to the child's own life: "Just like YOUR home...", "In YOUR town..."

Cambridge KS1 Geography & Social Studies objectives (Grade 1, age 5–6):

PLACE KNOWLEDGE:
- Name and locate the world's seven continents and five oceans
- Understand geographical similarities and differences between a small area of the UK and a small area of a contrasting non-European country
- Identify the location of hot and cold areas of the world in relation to the Equator and the North and South Poles
- Use basic geographical vocabulary to describe key physical and human features

HUMAN & PHYSICAL GEOGRAPHY:
- Identify seasonal and daily weather patterns
- Name and describe key physical features: beach, cliff, coast, forest, hill, mountain, sea, ocean, river, valley
- Name and describe key human features: city, town, village, factory, farm, house, office, port, harbour, shop
- Understand how weather affects what people wear, eat and do

PEOPLE & COMMUNITIES:
- Understand that people around the world live in different types of homes
- Learn about different foods, clothing, transport and traditions around the world
- Recognise similarities and differences between their own life and lives in other places
- Develop respect and curiosity for different cultures and ways of life

Output rules — STRICTLY enforced:
- Return ONLY valid JSON. Zero markdown fences. Zero text outside the JSON.
- steps must have EXACTLY 6 items: 3 content then 3 quiz in that order
- estimatedMinutes must be 10, cambridgeStage must be "KS1", grade must be 1
- activityPrompt on every content step — observation or imagination activity, no materials needed
- worldFact on every content step — one genuinely surprising geographical or cultural fact
- voiceScript on every content step — written for speaking, wonder-filled and slow, with '...' pauses
- repeatAfterMe on every content step — 2 to 4 geography words or place names the child echoes
- voicePrompt on every quiz step — introduces the question with geographical wonder
- listenFor on every quiz step — at least 2 accepted spoken answer variations
- voiceExplanation on every quiz step — spoken wonder + celebration, warmer than display text
- Quiz Q1 = easy recall, Q2 = apply the concept, Q3 = gentle geographical thinking stretch
- Use emojis generously — flags 🏳️, landscapes 🏔️🌊🏜️, weather ☀️🌧️❄️, people 👨‍👩‍👧 to make the world visual`;

// ─────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────
function buildUserPrompt(
  strand: "place-knowledge" | "human-physical" | "people-communities",
  topic: string,
  angle: string,
  priorKnowledge: string,
  difficulty: "foundational" | "building" | "stretch",
  explorerFocus?: string
): string {
  const difficultyInstructions = {
    foundational: "Very gentle introduction. Start with what the child already knows — their own home, street, school. Expand outward from there. Build wonder and a sense of belonging to a big, beautiful world.",
    building: "One new geographical idea layered onto what they know. Make explicit links to the child's own experience. Introduce simple geographical vocabulary.",
    stretch: "Connect two geographical concepts. Q3 should require the child to think like a geographer — compare, predict or reason about places and people.",
  };

  const strandContext = {
    "place-knowledge": "STRAND: Place Knowledge — focus on the child's immediate world (home, school, local area) expanding to countries, continents and oceans.",
    "human-physical": "STRAND: Human & Physical Geography — focus on weather, landscapes, physical features (mountains, rivers, oceans) and how they shape where and how people live.",
    "people-communities": "STRAND: People & Communities — focus on how people around the world live, eat, celebrate and travel, building respect and curiosity for different cultures.",
  };

  return `Generate a Cambridge KS1 Geography & Social Studies lesson for Grade 1 (age 5–6).

${strandContext[strand]}
Topic: ${topic}
Lesson angle: ${angle}

Prior knowledge:
${priorKnowledge}

Difficulty: ${difficulty}
Instruction: ${difficultyInstructions[difficulty]}

${explorerFocus ? `Explorer spotlight: Briefly introduce ${explorerFocus} in one content step — their name, one child-friendly fun fact, and one place they explored or discovery they made. Frame them as a real world explorer just like the child.` : ""}

Activity prompts must be doable RIGHT NOW — no materials needed:
- "Look out the window — describe 3 things you can see in your neighbourhood!"
- "Close your eyes and imagine you are standing on top of a mountain 🏔️ — what do you see?"
- "Point to where the sun is right now — that tells us something about our world!"
- "Think of a food you eat at home — where do you think it comes from?"
- "Imagine you live in the desert 🏜️ — what would be different about your day?"
- "Draw an imaginary map of your bedroom — where is the door? The window?"

World facts must be genuinely surprising and age-appropriate:
- Short — one sentence maximum
- Wow-factor — something the child will want to tell their family
- Accurate — real geography, simplified

Return JSON matching the EXACT schema. No extra fields. No missing fields. No markdown.
${OUTPUT_SCHEMA}`;
}

// ─────────────────────────────────────────────────────────────────
// THE 6 LESSON PROGRESSION
// ─────────────────────────────────────────────────────────────────
const grade1WorldLessons = [

  // ── v1 · PLACE KNOWLEDGE · My world ────────────────────────────
  {
    version: 1,
    topicFocus: "my-world — home, school, local area, maps and directions",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "place-knowledge",
      "My World — Home, School and Neighbourhood",
      "Start with the child's immediate world and expand outward like zoom on a map. My ROOM → my HOME 🏠 → my STREET → my NEIGHBOURHOOD → my TOWN/CITY → my COUNTRY → the WORLD 🌍. A MAP is a picture of a place from above — like a bird's eye view 🐦. Simple directions: left ⬅️, right ➡️, forward ⬆️, backward ⬇️. Landmarks help us find our way: the school 🏫, the park 🌳, the shops 🏪.",
      "- Knows their home address and school name\n- Has not yet thought about maps or geographical scale\n- This is their very first geography lesson",
      "foundational",
      "Ibn Battuta"
    ),
  },

  // ── v2 · PLACE KNOWLEDGE · Continents and oceans ───────────────
  {
    version: 2,
    topicFocus: "continents-oceans — 7 continents, 5 oceans, where we live on Earth",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "place-knowledge",
      "Our Amazing Planet — Continents and Oceans",
      "Earth 🌍 is mostly water — oceans cover 71% of the surface! There are 7 CONTINENTS (large areas of land): Africa 🌍, Antarctica ❄️, Asia 🌏, Australia/Oceania 🦘, Europe 🏰, North America 🗽, South America 🌿. There are 5 OCEANS: Pacific (biggest!), Atlantic, Indian, Southern, Arctic. The EQUATOR is an imaginary line around the middle of Earth — places near it are HOT ☀️, places near the poles are COLD ❄️.",
      "- Knows their local area and what a map is (Lesson 1)\n- Has seen globes and world maps but not named continents formally\n- Has not yet learned about the Equator or poles",
      "building",
      "Amelia Earhart"
    ),
  },

  // ── v3 · HUMAN & PHYSICAL · Weather and landscapes ─────────────
  {
    version: 3,
    topicFocus: "weather-landscapes — weather types, physical features: mountains, rivers, oceans",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "human-physical",
      "Weather and Amazing Landscapes",
      "WEATHER is what the sky and air are like outside right now: sunny ☀️, rainy 🌧️, cloudy ⛅, windy 💨, snowy ❄️, stormy ⛈️. Weather changes every day! LANDSCAPES are the shapes of the land: mountains 🏔️ (very high land), valleys (low land between mountains), rivers 🏞️ (water flowing to the sea), beaches 🏖️ (where land meets the sea), forests 🌲 (lots of trees), deserts 🏜️ (very dry land). Different landscapes have different weather.",
      "- Knows weather words from everyday life\n- Knows continents and oceans (Lesson 2)\n- Has not yet connected weather to landscapes formally",
      "foundational"
    ),
  },

  // ── v4 · HUMAN & PHYSICAL · Hot and cold places ────────────────
  {
    version: 4,
    topicFocus: "hot-cold-places — deserts, rainforests, polar regions and how people adapt",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "human-physical",
      "Hot, Cold and Wild Places!",
      "The world has EXTREME places! HOT DESERT 🏜️ (Sahara, Africa) — almost no rain, scorching hot days, freezing cold nights, camels 🐪 store water in their humps. RAINFOREST 🌿 (Amazon, South America) — rain EVERY day, millions of animals, tallest trees on Earth. POLAR REGIONS ❄️ (Arctic and Antarctic) — ice and snow all year, polar bears 🐻‍❄️ and penguins 🐧. People and animals ADAPT to survive in each place — they change their behaviour, clothing and food to suit their environment.",
      "- Knows weather types and landscape features (Lesson 3)\n- Knows where continents are (Lesson 2)\n- Has not yet explored extreme environments or the concept of adaptation",
      "building",
      "Ernest Shackleton"
    ),
  },

  // ── v5 · PEOPLE & COMMUNITIES · How people live ────────────────
  {
    version: 5,
    topicFocus: "how-people-live — homes, food, transport around the world",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "people-communities",
      "How People Live Around the World",
      "People all over the world have the SAME basic needs: a home 🏠, food 🍽️, water 💧, family 👨‍👩‍👧, and community. But HOW they meet those needs looks VERY different! Homes: igloo ❄️ (Arctic), stilt house 🏠 (flood areas), mud house 🏡 (hot dry areas), apartment 🏢 (cities). Food: rice 🍚 (Asia), injera bread 🫓 (Ethiopia), tacos 🌮 (Mexico), pasta 🍝 (Italy). Transport: camel 🐪, boat ⛵, tuk-tuk, bicycle 🚲, train 🚂. Different does not mean better or worse — just different and interesting!",
      "- Knows hot, cold and wild places (Lesson 4)\n- Knows continents and where different environments are (Lessons 2–4)\n- Has not yet formally compared how people live in different parts of the world",
      "building"
    ),
  },

  // ── v6 · PEOPLE & COMMUNITIES · Celebrations and cultures ───────
  {
    version: 6,
    topicFocus: "celebrations-cultures — festivals, traditions, similarities across the world",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "people-communities",
      "Celebrations Around Our Amazing World!",
      "Every culture in the world has CELEBRATIONS — special times when people come together with food, music, dancing and traditions. Diwali 🪔 (India/Hindu) — festival of lights. Chinese New Year 🐉 (China) — lanterns, dragons, fireworks. Eid 🌙 (Muslim communities worldwide) — feasting and giving. Christmas 🎄 (Christian communities) — gifts and family. Holi 🎨 (India) — throwing coloured powder! All celebrations share the same things: family 👨‍👩‍👧, food 🍽️, music 🎵, and joy 😊. We are more SIMILAR than we are different!",
      "- Knows how people live around the world (Lesson 5)\n- Has experienced celebrations at home\n- Has not yet formally compared celebrations across cultures",
      "stretch"
    ),
  },
];

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding KS1 Geography & Social Studies (World) — Grade 1 Progression (6 lessons)...\n");

  const topicLabels: Record<number, string> = {
    1: "Place Knowledge · My World",
    2: "Place Knowledge · Continents & Oceans",
    3: "Human & Physical · Weather & Landscapes",
    4: "Human & Physical · Hot, Cold & Wild Places",
    5: "People & Communities · How People Live",
    6: "People & Communities · Celebrations & Cultures",
  };

  for (const lesson of grade1WorldLessons) {
    const record = {
      subjectId: "world",
      subjectName: "Geography",
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

  console.log("✨ Done! 6 KS1 Geography Grade 1 lessons seeded.\n");
  console.log("📋 Lesson sequence:");
  grade1WorldLessons.forEach((l) => {
    const slug = l.topicFocus.split(" — ")[0];
    console.log(`   v${l.version} → lesson:1:world:v${l.version}:${slug}`);
  });
  console.log("\n🌍 Strands covered:");
  console.log("   v1–v2 · Place Knowledge (my world → continents & oceans)");
  console.log("   v3–v4 · Human & Physical Geography (weather → extreme places)");
  console.log("   v5–v6 · People & Communities (how people live → celebrations)");
  console.log("\n🧭 Explorer spotlights:");
  console.log("   v1 · Ibn Battuta — medieval explorer who travelled 75,000 miles");
  console.log("   v2 · Amelia Earhart — first woman to fly solo across the Atlantic");
  console.log("   v4 · Ernest Shackleton — Antarctic explorer and survival legend");
  console.log("\n➡️  Next steps:");
  console.log("   pnpm db:seed-world  — run this seed");
  console.log("   pnpm db:verify      — confirm all subjects pass generation");
  console.log("   pnpm warm-cache     — pre-generate into Redis");
  console.log("\n🎉 Grade 1 KS1 curriculum complete!");
  console.log("   Math · English · Art · Science · Music · Puzzles · World");
  console.log("   7 subjects · 44 lessons · fully seeded and cached");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
