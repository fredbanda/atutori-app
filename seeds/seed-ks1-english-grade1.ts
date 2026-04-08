// prisma/seeds/ks1-english-grade1.ts
// Cambridge KS1 English — Grade 1 · Age 5–6
// 7 lessons · Phonics → Reading → Vocabulary
// Voice-first: TTS + echo counting + Whisper STT
// Run: npx ts-node prisma/seeds/ks1-english-grade1.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────
// OUTPUT SCHEMA
// Extended with voice fields throughout.
// voiceScript  — what TTS speaks (different from display text)
// repeatAfterMe — array of sounds/words child echoes one by one
// listenFor    — what Whisper should match on (lowercase, flexible)
// soundButtons — phoneme buttons the child can tap to hear sounds
// ─────────────────────────────────────────────────────────────────
const OUTPUT_SCHEMA = JSON.stringify(
  {
    title: "string — fun lesson title, max 6 words, 1 emoji allowed",
    cambridgeStage: "KS1",
    subject: "English",
    grade: 1,
    estimatedMinutes: 10,
    strand: "string — phonics | reading | vocabulary",
    steps: [
      {
        type: "content",
        title: "string — short punchy title, max 5 words",
        content: "string — 2 to 3 simple sentences for display, age 5–6",
        example: "string — vivid example with emojis for display",
        voiceScript:
          "string — what the TTS voice actually says. Warm, slow, encouraging. Written for listening not reading. Include natural pauses with '...'",
        repeatAfterMe: [
          "string — first sound or word the child echoes",
          "string — second",
          "string — third (max 5 items per content step)",
        ],
        soundButtons: [
          {
            label: "string — the letter or word shown on the button",
            sound: "string — phonetic pronunciation hint for TTS e.g. 'ah' for a, 'buh' for b",
          },
        ],
      },
      {
        type: "quiz",
        question: "string — display question text",
        voicePrompt:
          "string — what TTS says to introduce this question. Encouraging, direct.",
        options: ["string", "string", "string", "string"],
        correctAnswer: "number — 0-indexed",
        listenFor: [
          "string — acceptable spoken answer e.g. 'cat', 'three', 'the letter a'",
        ],
        explanation: "string — celebration + reason. Start with Amazing! or You got it! etc.",
        hint: "string — gentle nudge on wrong answer",
        voiceExplanation:
          "string — spoken version of the explanation, warmer and slower than display text",
      },
    ],
  },
  null,
  2
)

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — shared across all 7 Grade 1 English lessons
// Voice-aware: knows the lesson will be spoken AND displayed
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a warm, playful Cambridge KS1 English tutor for children aged 5 to 6! 📚✨

Your personality:
- Enthusiastic and encouraging — every sound a child makes is celebrated!
- Use emojis in display text to make words visual: 🐱 for cat, 🐶 for dog, ☀️ for sun
- Talk directly to the child: "Can YOU say that sound?" "Listen carefully..."
- Short, clear sentences — one idea at a time
- Celebrate every attempt: "Brilliant! 🌟" "You said it! ⭐" "What a GREAT sound! 🎉"
- On wrong answers: "Ooh close! Listen again... 👂" — never say wrong or incorrect

VOICE-FIRST DESIGN — this is critical:
- Every lesson is spoken aloud by a text-to-speech voice AND displayed on screen
- The voiceScript field is what the TTS reads — write it for LISTENING, not reading
  - Use natural speech patterns: "Let's... try... that... together!"
  - Add "..." for natural pauses where the child should echo or respond
  - Spell out letter sounds phonetically: write "ah" not "a", "buh" not "b", "cuh" not "c"
  - Never say emoji names — say "a cat" not "cat emoji"
- The repeatAfterMe array is the echo sequence — TTS says each item, pauses, child repeats
  - For phonics: individual letter sounds e.g. ["ah", "buh", "cuh"]
  - For words: whole words e.g. ["cat", "sat", "mat"]
  - For sentences: short phrases e.g. ["the cat", "sat on", "the mat"]
- The listenFor array tells Whisper what to accept — include common variations
  - e.g. for the letter 'a': ["a", "ah", "ay", "the letter a"]
  - e.g. for the word 'cat': ["cat", "a cat", "khat"] — be generous

Cambridge KS1 English objectives (Grade 1, age 5–6):
Phonics:
  - Learn the sounds (phonemes) for letters a–z
  - Blend phonemes to read simple CVC words (consonant-vowel-consonant): cat, sit, dog
  - Segment words into phonemes to spell: c-a-t
  - Recognise high-frequency sight words: the, a, I, is, it, and, to, go, no
Reading:
  - Read simple CVC words
  - Read short sentences using phonics knowledge and sight words
  - Understand what they read — match text to pictures
Vocabulary:
  - Name everyday objects (nouns): animals, body parts, classroom objects
  - Use describing words (adjectives): big, small, red, happy
  - Learn action words (verbs): run, sit, jump, eat

Output rules — STRICTLY enforced:
- Return ONLY valid JSON. Zero markdown fences. Zero text outside the JSON.
- steps must have EXACTLY 6 items: 3 content then 3 quiz in that order
- estimatedMinutes must be 10, cambridgeStage must be "KS1", grade must be 1
- voiceScript must be written for speaking — warm, slow, with "..." pauses
- repeatAfterMe: 2 to 5 items per content step — never more than 5
- soundButtons: 2 to 4 buttons per content step
- listenFor: at least 2 accepted variations per quiz step
- Quiz Q1 = easy recognition, Q2 = apply the sound/word, Q3 = gentle stretch`

// ─────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────
function buildUserPrompt(
  strand: "phonics" | "reading" | "vocabulary",
  topicAngle: string,
  priorKnowledge: string,
  challengeLevel: "foundational" | "building" | "stretch",
  voiceGuidance: string
): string {
  const levelInstructions = {
    foundational:
      "Very gentle introduction. Lots of repetition. Every new sound or word gets at least 3 chances to echo. Build pure confidence.",
    building:
      "One new idea layered onto what they know. Make explicit links to prior sounds or words in the voiceScript.",
    stretch:
      "Combine two concepts they know. Q3 should be a real thinking challenge — a short word to blend or a sentence to complete.",
  }

  return `Generate a Cambridge KS1 English lesson for Grade 1 (age 5–6).

Strand: ${strand}
Lesson angle: ${topicAngle}

Prior knowledge coming into this lesson:
${priorKnowledge}

Challenge level: ${challengeLevel}
Instruction: ${levelInstructions[challengeLevel]}

Voice guidance for this specific lesson:
${voiceGuidance}

Critical reminders:
- voiceScript is spoken aloud by TTS — write it in slow, warm spoken English with "..." pauses
- repeatAfterMe items are echoed by the child one at a time — keep each item short (1–3 syllables)
- soundButtons let the child tap to hear a sound on demand — essential for phonics steps
- listenFor must be generous — young children mispronounce, accept variations
- Display text (content, example, question) uses emojis freely
- voiceScript and voiceExplanation NEVER mention emojis by name — describe them instead

Return JSON matching the EXACT schema provided. No extra fields. No missing fields. No markdown.
${OUTPUT_SCHEMA}`
}

// ─────────────────────────────────────────────────────────────────
// THE 7 LESSON PROGRESSION
// ─────────────────────────────────────────────────────────────────
const grade1EnglishLessons = [

  // ── v1 · PHONICS · Letter sounds a, s, t, p, i, n ─────────────
  {
    version: 1,
    topicFocus: "letter-sounds — learn phonemes a, s, t, p, i, n",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "phonics",
      "Six foundational letter sounds: a (as in apple), s (as in sun), t (as in tap), p (as in pin), i (as in insect), n (as in net). These are the first letters taught in Cambridge phonics because they combine to make many simple words.",
      "- Knows the alphabet visually (can recognise letters A–Z)\n- Has not yet learned letter sounds formally\n- This is their very first phonics lesson",
      "foundational",
      `- Say each sound slowly and clearly: "ah... sss... tuh... puh... ih... nnn..."
- For the repeatAfterMe sequence, use SOUNDS not letter names: "ah" not "ay", "sss" not "ess"
- soundButtons should show the uppercase letter AND the example word: A (apple), S (sun)
- voiceScript for content step 1: introduce the idea that letters make sounds, not just names
- Keep repeatAfterMe to 3 sounds per step so the child is not overwhelmed
- Q3 stretch: given a picture description (e.g. "an animal that says meow"), which starting sound does it begin with?`
    ),
  },

  // ── v2 · PHONICS · Blending CVC words ─────────────────────────
  {
    version: 2,
    topicFocus: "blending-cvc — blend sounds to read simple words: sat, pin, tap, nip",
    difficultyHint: "foundational",
    userPrompt: buildUserPrompt(
      "phonics",
      "Blending consonant-vowel-consonant (CVC) words using only the 6 sounds learned in Lesson 1: a, s, t, p, i, n. Words: sat, sit, tap, tip, nip, pan, tan, sip. The child learns to say each sound separately then push them together.",
      "- Knows sounds: a, s, t, p, i, n (Lesson 1)\n- Has never tried to blend sounds into words\n- This is their first experience of decoding written words",
      "foundational",
      `- voiceScript must model blending explicitly: "Listen... sss... ah... tuh... Now push them together... sat! Did you hear it? s-a-t makes SAT!"
- repeatAfterMe: blend one word at a time — say the segmented sounds THEN the blended word: ["sss-ah-tuh", "sat", "puh-ih-nnn", "pin"]
- soundButtons: show the individual letters of a word so the child can tap each sound
- For quiz questions, describe pictures instead of showing letter strings: "a thing you do on a chair" (sit)
- Q3: introduce one new word they have to blend without hearing it first`
    ),
  },

  // ── v3 · PHONICS · Sight words ────────────────────────────────
  {
    version: 3,
    topicFocus: "sight-words — recognise high-frequency words: the, a, I, is, it, and, to, go",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "phonics",
      "High-frequency sight words that cannot be fully decoded phonetically and must be recognised by sight: the, a, I, is, it, and, to, go, no. These appear in almost every sentence a child will read.",
      "- Can blend CVC words using a, s, t, p, i, n (Lesson 2)\n- Has not yet encountered words that don't follow phonics rules\n- May try to sound out 'the' as tuh-huh-eh which does not work",
      "building",
      `- voiceScript must acknowledge the quirk: "Some words are sneaky — they do not sound the way you expect! We just have to REMEMBER them. Let's meet the sneaky words!"
- repeatAfterMe: say the word, spell it, say it again: ["the", "t-h-e", "the"] — this embeds both sound and spelling
- soundButtons: show each sight word as a whole unit — tapping says the whole word, not individual sounds
- Frame memorisation as a superpower: "When you know these words by heart, reading becomes SO much faster!"
- Q3: a short sentence completion — "I ___ going to school" (am/is/the) — child must recognise the right sight word`
    ),
  },

  // ── v4 · PHONICS · Rhyming words ──────────────────────────────
  {
    version: 4,
    topicFocus: "rhyming-words — recognise and produce rhymes: cat/hat/mat, sit/bit/hit",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "phonics",
      "Recognising rhyming words — words that share the same ending sound (rime). Word families: -at (cat, hat, mat, sat, bat), -it (sit, bit, hit, pit, kit), -an (pan, tan, man, ran). Rhyming builds phonemic awareness and spelling pattern recognition.",
      "- Can blend CVC words (Lesson 2)\n- Knows sight words (Lesson 3)\n- Has heard rhymes in songs and stories but has not analysed them",
      "building",
      `- voiceScript: make it feel like a game or song — "I say cat... you say a word that RHYMES! Ready? Cat... what rhymes with cat? Hat! Mat! Sat! You try!"
- repeatAfterMe: say the root word then pause for the child to supply a rhyme — ["cat... hat", "sit... bit", "pan... man"]
- soundButtons: show the word family ending as a unit: "-at", "-it", "-an" — tapping says the rime sound
- Use a rhyming song pattern in voiceScript for content step 2
- Q3: which word does NOT belong in the rhyming group? (cat, hat, dog, mat) — tests discrimination`
    ),
  },

  // ── v5 · READING · Reading simple words in context ────────────
  {
    version: 5,
    topicFocus: "reading-words — read simple CVC words and sight words in short phrases",
    difficultyHint: "building",
    userPrompt: buildUserPrompt(
      "reading",
      "Reading simple words in context — short 2–3 word phrases using CVC words and sight words already learned. Examples: 'a cat', 'the pin', 'it sat', 'go and sit'. The child reads the phrase, TTS confirms, they echo back.",
      "- Knows sounds a, s, t, p, i, n and can blend CVC words (Lessons 1–2)\n- Knows sight words: the, a, I, is, it, and, to, go (Lesson 3)\n- Knows rhyming word families (Lesson 4)\n- Now putting it all together to read in context for the first time",
      "building",
      `- voiceScript: "You have learned SO much! Today we are going to READ real phrases — like a proper reader! 📖"
- repeatAfterMe: the child reads each phrase after hearing it: ["a cat", "the pin", "it sat", "go and sit"]
- soundButtons: show each word in the phrase separately — tap to hear, then try to read without tapping
- Celebrate the act of reading loudly: "You just READ that! That is READING! 🎉"
- Q3: show a short phrase and ask what it means — match phrase to picture description`
    ),
  },

  // ── v6 · READING · Simple sentences ───────────────────────────
  {
    version: 6,
    topicFocus: "simple-sentences — read and understand simple sentences",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "reading",
      "Reading complete simple sentences using all phonics and sight word knowledge. Sentences: 'The cat sat.', 'I can sit.', 'A pin is it.', 'The tan pan.'. Focus on reading left to right, one word at a time, and understanding the meaning.",
      "- Can read 2–3 word phrases (Lesson 5)\n- Has full phonics toolkit: sounds, blending, sight words, rhymes\n- Now reading complete sentences with punctuation for the first time",
      "stretch",
      `- voiceScript: slow down for each sentence — "Let's read this together... one... word... at... a... time. Ready? The... cat... sat. THE CAT SAT! You try!"
- repeatAfterMe: whole sentences one word at a time then the full sentence: ["The", "cat", "sat", "The cat sat."]
- soundButtons: individual words in the sentence — let the child decode each one before hearing the full sentence
- Introduce the concept of a full stop: "See that little dot at the end? That means STOP — the sentence is finished!"
- Q3: read a sentence and choose which picture matches — reading comprehension, not just decoding`
    ),
  },

  // ── v7 · VOCABULARY · Naming words (nouns) ────────────────────
  {
    version: 7,
    topicFocus: "naming-words — learn and use everyday nouns: animals, objects, body parts",
    difficultyHint: "stretch",
    userPrompt: buildUserPrompt(
      "vocabulary",
      "Everyday nouns in three categories: animals (cat, dog, hen, pig, ant), classroom objects (pen, bag, cup, book, mat), body parts (arm, leg, lip, hip, rib). The child learns to name, recognise and use these words. Connects strongly to reading — these are the words they will read in early books.",
      "- Can read simple sentences (Lesson 6)\n- Has built up phonics and reading skills across 6 lessons\n- Now explicitly expanding vocabulary to support reading comprehension",
      "stretch",
      `- voiceScript: introduce categories as collections — "Words are sorted into groups! Animals are NAMING words. Objects are NAMING words. Body parts are NAMING words. We call them NOUNS!"
- repeatAfterMe: category by category — animals: ["cat", "dog", "hen"], objects: ["pen", "bag", "cup"]
- soundButtons: show each word with its emoji — tapping says the word clearly
- Include a sorting challenge in content step 3: is 'book' an animal or an object?
- Q3: name the odd one out — "cat, dog, pen, hen" — which is not an animal? Tests category understanding`
    ),
  },
]

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding KS1 English — Grade 1 Progression (7 lessons)...\n")

  const strandMap: Record<number, string> = {
    1: "Phonics", 2: "Phonics", 3: "Phonics", 4: "Phonics",
    5: "Reading", 6: "Reading",
    7: "Vocabulary",
  }

  for (const lesson of grade1EnglishLessons) {
    const record = {
      subjectId: "english",
      subjectName: "English",
      cambridgeStage: "KS1",
      grade: 1,
      isActive: true,
      contentSteps: 3,
      quizCount: 3,
      systemPrompt: SYSTEM_PROMPT,
      outputSchema: OUTPUT_SCHEMA,
      ...lesson,
    }

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
    })

    const strand = strandMap[result.version]
    const weekLabel = result.version <= 4 ? "Week 1" : "Week 2"
    console.log(`  ✅ v${result.version} · ${weekLabel} · ${strand} · "${result.topicFocus}"`)
    console.log(`     Voice: TTS script + echo sequence + Whisper matching\n`)
  }

  console.log("✨ Done! 7 KS1 English Grade 1 lessons seeded.\n")
  console.log("📋 Lesson sequence:")
  grade1EnglishLessons.forEach((l) => {
    const slug = l.topicFocus.split(" — ")[0]
    console.log(`   v${l.version} → lesson:1:english:v${l.version}:${slug}`)
  })
  console.log("\n🎤 Voice fields in every lesson:")
  console.log("   content → voiceScript, repeatAfterMe, soundButtons")
  console.log("   quiz    → voicePrompt, listenFor, voiceExplanation")
  console.log("\n➡️  Next: wire OpenAI TTS to voiceScript on lesson load")
  console.log("   Then: wire Whisper to repeatAfterMe echo sequences")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
