// seeds/seed-ks1-music-grade1.ts
// Cambridge KS1 Music — Grade 1 · Age 5–6
// 6 lessons · Performing (v1–v2) → Listening (v3–v4) → Composing (v5–v6)
// Performer theme — "You are a musician today!"
// Run: pnpm db:seed-music

import dotenv from "dotenv";
dotenv.config({ override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────
// OUTPUT SCHEMA
// Same 6-step structure (3 content + 3 quiz).
// Music-specific: activityPrompt (something the child performs now)
// and musicFact (one wow fact about music or the featured musician).
// ─────────────────────────────────────────────────────────────────
const OUTPUT_SCHEMA = JSON.stringify(
  {
    title: "string — exciting lesson title, max 6 words, 1 emoji allowed",
    cambridgeStage: "KS1",
    subject: "Music",
    grade: 1,
    estimatedMinutes: 10,
    steps: [
      {
        type: "content",
        title: "string — short punchy title, max 5 words",
        content: "string — 2 to 3 simple sentences for age 5–6. Energetic, joyful, encouraging.",
        example: "string — vivid real-world example with emojis",
        activityPrompt: "string — something the child can PERFORM or DO right now e.g. 'Clap this rhythm with me: CLAP clap clap CLAP!'",
        musicFact: "string — one WOW fact about music or the featured musician. Short, surprising, age-appropriate.",
        voiceScript: "string — what TTS speaks aloud. Energetic, joyful, slow enough to perform along to. Use '...' for pauses where child joins in.",
        repeatAfterMe: [
          "string — first musical word, sound or rhythm the child echoes e.g. 'CLAP clap clap'",
          "string — second (max 4 items)",
        ],
      },
      {
        type: "quiz",
        question: "string — musical question, use emojis where possible",
        options: ["string", "string", "string", "string"],
        correctAnswer: "number — 0-indexed",
        explanation: "string — celebration + musical reason. Start with Amazing! or You got it! etc.",
        hint: "string — gentle musical nudge on wrong answer",
        voicePrompt: "string — what TTS says to introduce this question. Energetic and musical.",
        listenFor: ["string — accepted spoken answer e.g. 'pulse', 'the pulse', 'steady beat'"],
        voiceExplanation: "string — spoken musical celebration, warmer and more joyful than display text.",
      },
    ],
  },
  null,
  2
);

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AMAZING Cambridge KS1 Music teacher for children aged 5 to 6! 🎵🎶✨

Your personality:
- You are a fellow performer — "WE are musicians today! Let's make music together!"
- Express pure joy: "Can you FEEL that beat?" "Music is EVERYWHERE!" "You sound fantastic!"
- Use emojis to make music visual: 🥁 drums, 🎹 piano, 🎸 guitar, 🎺 trumpet, 🎻 violin, 🎤 singing
- Talk directly to the child: "Can YOU clap that rhythm?" "What do YOU hear?"
- Short, clear sentences — one musical idea at a time
- Celebrate every attempt: "Brilliant! 🌟" "What a great musician! ⭐" "I can hear you trying — keep going! 🎵"
- On wrong answers: "Ooh close! Listen again... 👂" — never say wrong or incorrect
- Frame everything as a performance: "Ready? 3, 2, 1... MUSIC!", "Let's play!", "Time to perform!"

Cambridge KS1 Music objectives (Grade 1, age 5–6):

PERFORMING:
- Use their voices expressively and creatively by singing songs and speaking chants and rhymes
- Play tuned and untuned instruments musically
- Listen with concentration and understanding to a range of high-quality live and recorded music
- Use and understand basic music vocabulary: pulse, rhythm, pitch, tempo, dynamics

LISTENING & APPRAISING:
- Listen carefully and describe music using musical vocabulary
- Identify instruments by sight and sound
- Respond to music through movement, drawing or words
- Learn about composers and musicians from different traditions and historical periods

COMPOSING:
- Experiment with, create, select and combine sounds using the inter-related dimensions of music
- Create simple rhythmic patterns using body percussion or instruments
- Understand that music has a pulse (steady beat) and rhythm (long and short sounds)
- Explore high and low pitch, loud and quiet dynamics, fast and slow tempo

Output rules — STRICTLY enforced:
- Return ONLY valid JSON. Zero markdown fences. Zero text outside the JSON.
- steps must have EXACTLY 6 items: 3 content then 3 quiz in that order
- estimatedMinutes must be 10, cambridgeStage must be "KS1", grade must be 1
- activityPrompt on every content step — something the child performs RIGHT NOW (clap, tap, hum, sing)
- musicFact on every content step — one genuinely surprising music fact, age-appropriate
- voiceScript on every content step — written for performing along to, with '...' pauses for the child to join in
- repeatAfterMe on every content step — 2 to 4 musical sounds, rhythms or words the child echoes
- voicePrompt on every quiz step — introduces the question with musical energy
- listenFor on every quiz step — at least 2 accepted spoken answer variations
- voiceExplanation on every quiz step — spoken musical celebration, joyful and warm
- Quiz Q1 = easy recall, Q2 = apply the concept, Q3 = gentle musical thinking stretch
- Use emojis generously so the child can visualise instruments and musical ideas`;

// ─────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────
function buildUserPrompt(
  strand: "performing" | "listening" | "composing",
  topic: string,
  angle: string,
  priorKnowledge: string,
  difficulty: "foundational" | "building" | "stretch",
  musicianFocus?: string
): string {
  const difficultyInstructions = {
    foundational: "Very gentle introduction. Build joy and confidence first. Every new idea gets a simple activity the child can do immediately.",
    building: "One new musical idea layered onto what they know. Make explicit links to prior music concepts.",
    stretch: "Connect two musical concepts. Q3 should require the child to think like a composer or performer — create, predict or compare.",
  };

  const strandContext = {
    performing: "STRAND: Performing — focus on using voice and body percussion to perform rhythms, songs and chants with expression.",
    listening: "STRAND: Listening & Appraising — focus on identifying instruments, describing music using vocabulary, and responding to famous pieces.",
    composing: "STRAND: Composing — focus on creating simple rhythmic and melodic patterns using pulse, rhythm, pitch, tempo and dynamics.",
  };

  return `Generate a Cambridge KS1 Music lesson for Grade 1 (age 5–6).

${strandContext[strand]}
Topic: ${topic}
Lesson angle: ${angle}

Prior knowledge:
${priorKnowledge}

Difficulty: ${difficulty}
Instruction: ${difficultyInstructions[difficulty]}

${musicianFocus ? `Musician spotlight: Briefly introduce ${musicianFocus} in one content step — their name, one child-friendly fun fact, and one famous piece or achievement described simply. Frame them as a real performer just like the child.` : ""}

Activity prompts must be performable RIGHT NOW with no instruments — body only:
- "Clap this rhythm with me: CLAP clap clap CLAP clap!"
- "Tap the pulse on your knees — steady and even like a heartbeat!"
- "Hum the highest note you can, then the lowest!"
- "Stomp for loud 🔊, tiptoe for quiet 🤫 — try both!"
- "Sing 'la la la' fast like a racing car 🏎️, then slow like a sleepy bear 🐻!"
- "Conduct an imaginary orchestra — wave your arms to the music!"

Music facts must be genuinely surprising and age-appropriate:
- Short — one sentence maximum
- Wow-factor — something the child will want to share
- Accurate — real music knowledge, simplified

Return JSON matching the EXACT schema. No extra fields. No missing fields. No markdown.
${OUTPUT_SCHEMA}`;
}

// ─────────────────────────────────────────────────────────────────
// THE 6 LESSON PROGRESSION
// ─────────────────────────────────────────────────────────────────
const grade1MusicLessons = [

  // ── v1 · PERFORMING · Pulse and rhythm ─────────────────────────
  {
    version: 1,
    topicFocus: "pulse-and-rhythm — steady beat vs long and short sounds",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "performing",
      "Pulse and Rhythm",
      "The PULSE is the steady heartbeat of music — it never changes speed, like a ticking clock 🕐. The RHYTHM is the pattern of long and short sounds on top of the pulse — like the syllables in words. 'El-e-phant' has 3 short sounds. 'Cat' has 1 short sound. Clapping names is a great way to feel rhythm. Body percussion: clap (hands), pat (knees), stamp (feet), click (fingers).",
      "- Has clapped and sung in nursery rhymes\n- Has not yet distinguished between pulse and rhythm formally\n- This is their first formal music lesson",
      "foundational",
      "Evelyn Glennie"
    ),
  },

  // ── v2 · PERFORMING · Singing and voice ────────────────────────
  {
    version: 2,
    topicFocus: "singing-and-voice — using voice expressively: pitch, dynamics, tempo",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "performing",
      "Your Amazing Voice",
      "Your voice is the most natural instrument in the world — and you were born with it! 🎤 Voices can be HIGH (like a mouse 🐭) or LOW (like a bear 🐻) — this is PITCH. Voices can be LOUD 🔊 or QUIET 🤫 — this is DYNAMICS. Voices can sing FAST 🏎️ or SLOW 🐢 — this is TEMPO. Singers use all three to tell stories and express feelings through music.",
      "- Knows pulse and rhythm (Lesson 1)\n- Sings songs from home and school but has not thought about voice as an instrument\n- Has not yet used musical vocabulary: pitch, dynamics, tempo",
      "building",
      "Miriam Makeba"
    ),
  },

  // ── v3 · LISTENING · Instruments of the orchestra ──────────────
  {
    version: 3,
    topicFocus: "instruments — families of instruments: strings, woodwind, brass, percussion",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "listening",
      "Meet the Instruments!",
      "Instruments are grouped into FAMILIES based on how they make sound. Strings 🎻 (violin, cello, guitar) — vibrating strings. Woodwind 🎷 (flute, clarinet, saxophone) — blowing through a tube. Brass 🎺 (trumpet, trombone, French horn) — buzzing lips into a metal tube. Percussion 🥁 (drums, xylophone, tambourine) — hitting or shaking. Voice 🎤 is also an instrument!",
      "- Knows pulse, rhythm, pitch, dynamics and tempo (Lessons 1–2)\n- Has seen instruments in pictures or on TV but not categorised them\n- This is their first lesson on instrument families",
      "foundational",
      "Ludwig van Beethoven"
    ),
  },

  // ── v4 · LISTENING · Describing music ──────────────────────────
  {
    version: 4,
    topicFocus: "describing-music — using musical vocabulary to describe what we hear",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "listening",
      "How Does Music Make You Feel?",
      "Music tells stories without words! We describe music using vocabulary: TEMPO (fast/slow), DYNAMICS (loud/quiet), PITCH (high/low), TEXTURE (lots of instruments/just one), MOOD (happy 😊, sad 😢, scary 😱, calm 😌, exciting 🎉). Composers choose these elements ON PURPOSE to make us feel things — just like artists choose colours.",
      "- Knows instrument families (Lesson 3)\n- Knows pitch, dynamics and tempo from singing (Lesson 2)\n- Has not yet combined all vocabulary to describe a piece of music",
      "building",
      "Antonio Vivaldi"
    ),
  },

  // ── v5 · COMPOSING · Creating rhythmic patterns ────────────────
  {
    version: 5,
    topicFocus: "rhythmic-patterns — creating and repeating rhythm patterns with body percussion",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "composing",
      "Be a Rhythm Composer!",
      "A COMPOSER is someone who creates music. YOU can be a composer right now! A rhythmic pattern is a short sequence of sounds that REPEATS. Use body percussion to compose: clap 👏, pat knees, stamp feet 🦶, click fingers. A 4-beat pattern: CLAP pat pat CLAP. When you repeat it, you have composed a rhythm! Patterns can be written as long (—) and short (.) sounds.",
      "- Knows pulse, rhythm and body percussion (Lesson 1)\n- Knows musical vocabulary: tempo, dynamics, pitch (Lessons 2–4)\n- Has performed rhythms but not yet created their own",
      "building"
    ),
  },

  // ── v6 · COMPOSING · Pitch and melody ──────────────────────────
  {
    version: 6,
    topicFocus: "pitch-and-melody — high and low sounds, steps and leaps, simple melodies",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "composing",
      "Make a Melody!",
      "A MELODY is a sequence of notes at different pitches — it is the tune you hum or sing. Notes can STEP (move to the next note up or down) or LEAP (jump over notes). High notes feel light and bright ✨, low notes feel deep and heavy 🌊. The simplest melody uses just 3 notes — like 'Hot Cross Buns' (E D C). Composers choose pitches to create a mood, just like artists choose colours.",
      "- Can create rhythmic patterns (Lesson 5)\n- Knows pitch, dynamics, tempo and mood (Lessons 2–4)\n- Has sung melodies but not yet thought about how they are constructed",
      "stretch",
      "Wolfgang Amadeus Mozart"
    ),
  },
];

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding KS1 Music — Grade 1 Progression (6 lessons)...\n");

  const topicLabels: Record<number, string> = {
    1: "Performing · Pulse & Rhythm",
    2: "Performing · Singing & Voice",
    3: "Listening · Instrument Families",
    4: "Listening · Describing Music",
    5: "Composing · Rhythmic Patterns",
    6: "Composing · Pitch & Melody",
  };

  for (const lesson of grade1MusicLessons) {
    const record = {
      subjectId: "music",
      subjectName: "Music",
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

  console.log("✨ Done! 6 KS1 Music Grade 1 lessons seeded.\n");
  console.log("📋 Lesson sequence:");
  grade1MusicLessons.forEach((l) => {
    const slug = l.topicFocus.split(" — ")[0];
    console.log(`   v${l.version} → lesson:1:music:v${l.version}:${slug}`);
  });
  console.log("\n🎵 Strands covered:");
  console.log("   v1–v2 · Performing (pulse, rhythm, voice)");
  console.log("   v3–v4 · Listening & Appraising (instruments, describing music)");
  console.log("   v5–v6 · Composing (rhythmic patterns, pitch & melody)");
  console.log("\n🎤 Musician spotlights:");
  console.log("   v1 · Evelyn Glennie — deaf percussionist");
  console.log("   v2 · Miriam Makeba — South African singing legend");
  console.log("   v3 · Ludwig van Beethoven — composed while deaf");
  console.log("   v4 · Antonio Vivaldi — The Four Seasons");
  console.log("   v6 · Wolfgang Amadeus Mozart — composing at age 5");
  console.log("\n➡️  Next steps:");
  console.log("   pnpm db:seed-music  — run this seed");
  console.log("   pnpm db:verify      — confirm all subjects pass generation");
  console.log("   pnpm warm-cache     — pre-generate into Redis");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
