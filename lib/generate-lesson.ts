// lib/actions/generate-lesson.ts
"use server"

import Anthropic from "@anthropic-ai/sdk"
import  prisma  from "@/utils/prisma"
import { redis } from "@/lib/redis" // your existing Redis client

const anthropic = new Anthropic()

// ─────────────────────────────────────────────────────────────────
// TYPES
// Matches the outputSchema defined in the seed file exactly.
// Import these wherever you render lessons.
// ─────────────────────────────────────────────────────────────────
export type ContentStep = {
  type: "content"
  title: string
  content: string
  example: string
}

export type QuizStep = {
  type: "quiz"
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  hint?: string
}

export type LessonStep = ContentStep | QuizStep

export type GeneratedLesson = {
  title: string
  cambridgeStage: string
  subject: string
  grade: number
  estimatedMinutes: number
  steps: LessonStep[]
}

// ─────────────────────────────────────────────────────────────────
// REDIS KEY + TTL
// Pattern: lesson:{grade}:{subjectId}:{topic-slug}
// TTL: 24 hours — after expiry Claude regenerates with fresh
// examples while staying on the same curriculum angle.
// ─────────────────────────────────────────────────────────────────
const REDIS_TTL_SECONDS = 60 * 60 * 24 // 24 hours

function buildRedisKey(
  grade: number,
  subjectId: string,
  topicFocus: string
): string {
  const slug = topicFocus
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
  return `lesson:${grade}:${subjectId}:${slug}`
}

// ─────────────────────────────────────────────────────────────────
// GENERATE LESSON
// 1. Load the matching SubjectPrompt from DB
// 2. Check Redis — return immediately if cached
// 3. Call Claude with the curated system + user prompt
// 4. Parse and validate the JSON response
// 5. Save to LessonCache (DB) + Redis
// 6. Return the typed lesson
// ─────────────────────────────────────────────────────────────────
export async function generateLesson(
  grade: number,
  subjectId: string,
  forceRegenerate = false
): Promise<{
  lesson: GeneratedLesson
  fromCache: boolean
  cacheId: string
}> {
  // Step 1 — load prompt
  const prompt = await prisma.subjectPrompt.findFirst({
    where: { subjectId, grade, isActive: true },
    orderBy: { version: "desc" }, // always use the latest version
  })

  if (!prompt) {
    throw new Error(
      `No active SubjectPrompt found for grade ${grade}, subject "${subjectId}". ` +
      `Run the seed file first.`
    )
  }

  const redisKey = buildRedisKey(grade, subjectId, prompt.topicFocus ?? subjectId)
  const cacheKey = `${grade}:${subjectId}`

  // Step 2 — Redis cache check
  if (!forceRegenerate) {
    const cached = await redis.get(redisKey)
    if (cached) {
      const dbCache = await prisma.lessonCache.findUnique({ where: { redisKey } })
      if (dbCache) {
        // Fire-and-forget usage tracking — never block the response
        prisma.lessonCache
          .update({
            where: { id: dbCache.id },
            data: { useCount: { increment: 1 }, lastUsedAt: new Date() },
          })
          .catch(() => {})

        return {
          lesson: JSON.parse(cached as any) as GeneratedLesson,
          fromCache: true,
          cacheId: dbCache.id,
        }
      }
    }
  }

  // Step 3 — call Claude with the curated prompts
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: prompt.systemPrompt,
    messages: [{ role: "user", content: prompt.userPrompt }],
  })

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("")

  // Step 4 — parse + validate
  let lesson: GeneratedLesson
  try {
    // Strip accidental markdown fences just in case
    const clean = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()
    lesson = JSON.parse(clean)
  } catch {
    throw new Error(
      `Claude returned invalid JSON.\n` +
      `First 300 chars: ${rawText.slice(0, 300)}`
    )
  }

  // Basic shape validation — catch prompt regressions early
  if (!lesson.steps || lesson.steps.length !== 6) {
    throw new Error(
      `Expected 6 steps (3 content + 3 quiz), got ${lesson.steps?.length ?? 0}. ` +
      `Check the system prompt output rules.`
    )
  }

  // Step 5 — persist to DB (upsert handles re-runs safely)
  const dbCache = await prisma.lessonCache.upsert({
    where: { redisKey },
    update: {
      generatedContent: lesson as object,
      promptVersion: prompt.version,
      useCount: { increment: 1 },
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + REDIS_TTL_SECONDS * 1000),
    },
    create: {
      promptId: prompt.id,
      redisKey,
      cacheKey,
      generatedContent: lesson as object,
      promptVersion: prompt.version,
      useCount: 1,
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + REDIS_TTL_SECONDS * 1000),
    },
  })

  // Step 5b — write to Redis with TTL
  await redis.set(redisKey, JSON.stringify(lesson), { ex: REDIS_TTL_SECONDS })

  return { lesson, fromCache: false, cacheId: dbCache.id }
}

// ─────────────────────────────────────────────────────────────────
// RECORD LESSON ATTEMPT
// Call this from your results page after a student finishes.
// Updates LessonAttempt + User.xp in a single transaction.
// ─────────────────────────────────────────────────────────────────
export async function recordLessonAttempt({
  userId,
  cacheId,
  subjectId,
  grade,
  cambridgeStage,
  score,
  totalQuestions,
  xpEarned,
  answers,
  durationSeconds,
}: {
  userId: string
  cacheId: string
  subjectId: string
  grade: number
  cambridgeStage: string
  score: number
  totalQuestions: number
  xpEarned: number
  answers: { questionIndex: number; selected: number; correct: boolean }[]
  durationSeconds?: number
}) {
  const passed = score / totalQuestions >= 0.7 // 70% pass threshold

  const [attempt] = await prisma.$transaction([
    prisma.lessonAttempt.create({
      data: {
        userId,
        cacheId,
        subjectId,
        grade,
        cambridgeStage,
        score,
        totalQuestions,
        xpEarned,
        passed,
        answers: JSON.parse(JSON.stringify(answers)),
        durationSeconds,
        completedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        lastActiveAt: new Date(),
      },
    }),
  ])

  return { attempt, passed }
}
