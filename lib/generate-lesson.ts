// lib/actions/generate-lesson.ts
"use server";

import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/utils/prisma";
import { redis } from "@/lib/redis"; // your existing Redis client

const anthropic = new Anthropic();

// ─────────────────────────────────────────────────────────────────
// TYPES
// Matches the outputSchema defined in the seed file exactly.
// Import these wherever you render lessons.
// ─────────────────────────────────────────────────────────────────
export type ContentStep = {
  type: "content";
  title: string;
  content: string;
  example: string;
};

export type QuizStep = {
  type: "quiz";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
};

export type LessonStep = ContentStep | QuizStep;

export type GeneratedLesson = {
  title: string;
  cambridgeStage: string;
  subject: string;
  grade: number;
  estimatedMinutes: number;
  steps: LessonStep[];
};

// ─────────────────────────────────────────────────────────────────
// REDIS KEY + TTL
// Pattern: lesson:{grade}:{subjectId}:{topic-slug}
// TTL: 24 hours — after expiry Claude regenerates with fresh
// examples while staying on the same curriculum angle.
// ─────────────────────────────────────────────────────────────────
const REDIS_TTL_SECONDS = 60 * 60 * 24;

function buildRedisKey(
  grade: number,
  subjectId: string,
  topicFocus: string,
  version: number
): string {
  const slug = (topicFocus || subjectId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return `lesson:${grade}:${subjectId}:v${version}:${slug}`;
}

// ── Get the next lesson version for a learner ─────────────────────
// Call this from the lesson page to know which version to serve.
// Returns the version number the learner should do next.
export async function getNextLessonVersion(
  userId: string,
  grade: number,
  subjectId: string
): Promise<number> {
  // Find the highest version the learner has PASSED
  const lastPassed = await prisma.lessonAttempt.findFirst({
    where: {
      userId,
      subjectId,
      grade,
      passed: true,
    },
    orderBy: { completedAt: "desc" },
    select: {
      cache: {
        select: { promptVersion: true },
      },
    },
  });

  const lastPassedVersion = lastPassed?.cache?.promptVersion ?? 0;

  // Check the next version exists before returning it
  const nextVersion = lastPassedVersion + 1;
  const nextPromptExists = await prisma.subjectPrompt.findFirst({
    where: { subjectId, grade, version: nextVersion, isActive: true },
    select: { version: true },
  });

  if (nextPromptExists) return nextVersion;

  // No more new lessons — return the last available version
  // (learner can replay the hardest one)
  const lastAvailable = await prisma.subjectPrompt.findFirst({
    where: { subjectId, grade, isActive: true },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return lastAvailable?.version ?? 1;
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
  lessonVersion: number = 1,
  forceRegenerate = false
): Promise<{
  lesson: GeneratedLesson;
  fromCache: boolean;
  cacheId: string;
  version: number;
  isLastLesson: boolean;
}> {
  // Load the specific version requested
  const prompt = await prisma.subjectPrompt.findFirst({
    where: { subjectId, grade, version: lessonVersion, isActive: true },
  });

  if (!prompt) {
    throw new Error(
      `No active prompt for grade ${grade} subject "${subjectId}" version ${lessonVersion}. ` +
        `Run the seed file first.`
    );
  }

  // Check if this is the last lesson in the series
  const nextPrompt = await prisma.subjectPrompt.findFirst({
    where: { subjectId, grade, version: lessonVersion + 1, isActive: true },
    select: { version: true },
  });
  const isLastLesson = !nextPrompt;

  const redisKey = buildRedisKey(
    grade,
    subjectId,
    prompt.topicFocus ?? subjectId,
    lessonVersion
  );
  const cacheKey = `${grade}:${subjectId}`;

  // Redis check
  if (!forceRegenerate) {
    const cached = await redis.get(redisKey);
    if (cached) {
      const dbCache = await prisma.lessonCache.findUnique({
        where: { redisKey },
      });
      if (dbCache) {
        prisma.lessonCache
          .update({
            where: { id: dbCache.id },
            data: { useCount: { increment: 1 }, lastUsedAt: new Date() },
          })
          .catch(() => {});

        // Handle cached data properly - it might be an object or string
        let lesson: GeneratedLesson;
        if (typeof cached === "string") {
          lesson = JSON.parse(cached) as GeneratedLesson;
        } else if (typeof cached === "object" && cached !== null) {
          // If Redis returns an object directly, use it
          lesson = cached as GeneratedLesson;
        } else {
          // Fallback to database cache if Redis data is corrupted
          lesson = dbCache.generatedContent as GeneratedLesson;
        }

        return {
          lesson,
          fromCache: true,
          cacheId: dbCache.id,
          version: lessonVersion,
          isLastLesson,
        };
      }
    }
  }

  // Generate from Claude
  console.log(
    "🔄 Sending request to Claude with model: claude-sonnet-4-20250514"
  );
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: prompt.systemPrompt,
    messages: [{ role: "user", content: prompt.userPrompt }],
  });
  console.log("✅ Claude response received");

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  let raw: Record<string, unknown>;
  try {
    const clean = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    raw = JSON.parse(clean);
  } catch {
    throw new Error(
      `Claude returned invalid JSON.\nFirst 300 chars: ${rawText.slice(0, 300)}`
    );
  }

  // Normalize AI response — handle both schema variants
  const lesson: GeneratedLesson = {
    title: (raw.title ?? raw.lesson_title ?? "Lesson") as string,
    cambridgeStage: ((raw.cambridgeStage ?? raw.curriculum_alignment ?? prompt.cambridgeStage) as string).includes("KS1") ? "KS1" : (raw.cambridgeStage ?? raw.curriculum_alignment ?? prompt.cambridgeStage) as string,
    subject: (raw.subject ?? subjectId) as string,
    grade: (raw.grade ?? grade) as number,
    estimatedMinutes: (raw.estimatedMinutes ?? 10) as number,
    steps: ((raw.steps ?? []) as Record<string, unknown>[]).map((s) => {
      const stepType = (s.type ?? s.step_type) as string;
      if (stepType === "quiz") {
        return {
          type: "quiz" as const,
          question: s.question as string,
          options: s.options as string[],
          correctAnswer: (s.correctAnswer ?? s.correct_answer ?? 0) as number,
          explanation: (s.explanation ?? "") as string,
          hint: s.hint as string | undefined,
        };
      }
      return {
        type: "content" as const,
        title: (s.title ?? "") as string,
        content: (s.content ?? "") as string,
        example: (s.example ?? "") as string,
      };
    }),
  };

  // Debug: log the actual response structure
  console.log("🔍 Claude response structure:", {
    hasSteps: !!lesson.steps,
    stepsLength: lesson.steps?.length ?? 0,
    keys: Object.keys(lesson),
    firstStep: lesson.steps?.[0] || "no steps",
  });

  if (!lesson.steps || lesson.steps.length !== 6) {
    throw new Error(
      `Expected 6 steps, got ${
        lesson.steps?.length ?? 0
      }. Check prompt output rules.\nRaw response (first 500 chars): ${rawText.slice(
        0,
        500
      )}`
    );
  }

  // Persist to DB + Redis
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
  });

  await redis.set(redisKey, JSON.stringify(lesson), "EX", REDIS_TTL_SECONDS);

  return {
    lesson,
    fromCache: false,
    cacheId: dbCache.id,
    version: lessonVersion,
    isLastLesson,
  };
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
  model = "claude",
  promptVersion = 1,
}: {
  userId: string;
  cacheId: string;
  subjectId: string;
  grade: number;
  cambridgeStage: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  answers: { questionIndex: number; selected: number; correct: boolean }[];
  durationSeconds?: number;
  model?: string;
  promptVersion?: number;
}) {
  const passed = score / totalQuestions >= 0.7; // 70% pass threshold

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
        model,
        promptVersion,
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
  ]);

  return { attempt, passed };
}

