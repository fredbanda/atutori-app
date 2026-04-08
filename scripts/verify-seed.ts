// scripts/verify-seed.ts
// Verifies all seeded SubjectPrompts and runs a live generation test per subject
// Run: pnpm db:verify

import dotenv from "dotenv";
dotenv.config({ override: true });

import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseLesson(raw: Record<string, unknown>, subjectId: string, grade: number, cambridgeStage: string) {
  return {
    title: (raw.title ?? raw.lesson_title ?? "Lesson") as string,
    cambridgeStage: ((raw.cambridgeStage ?? cambridgeStage) as string).includes("KS1") ? "KS1" : cambridgeStage,
    subject: (raw.subject ?? subjectId) as string,
    grade: (raw.grade ?? grade) as number,
    estimatedMinutes: (raw.estimatedMinutes ?? 10) as number,
    steps: ((raw.steps ?? []) as Record<string, unknown>[]).map((s) => {
      const t = (s.type ?? s.step_type) as string;
      if (t === "quiz") return {
        type: "quiz",
        question: s.question,
        options: s.options,
        correctAnswer: (s.correctAnswer ?? s.correct_answer ?? 0) as number,
        explanation: (s.explanation ?? "") as string,
        hint: s.hint,
      };
      return { type: "content", title: s.title ?? "", content: s.content ?? "", example: s.example ?? "" };
    }),
  };
}

async function testGeneration(prompt: Awaited<ReturnType<typeof prisma.subjectPrompt.findFirst>>) {
  if (!prompt) return null;
  const start = Date.now();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: prompt.systemPrompt,
    messages: [{ role: "user", content: prompt.userPrompt }],
  });
  const elapsed = Date.now() - start;
  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const clean = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const raw = JSON.parse(clean);
  return { lesson: parseLesson(raw, prompt.subjectId, prompt.grade, prompt.cambridgeStage), elapsed };
}

function validateLesson(lesson: ReturnType<typeof parseLesson>) {
  const issues: string[] = [];
  const content = lesson.steps.filter((s) => s.type === "content");
  const quiz = lesson.steps.filter((s) => s.type === "quiz");
  if (lesson.steps.length !== 6) issues.push(`Expected 6 steps, got ${lesson.steps.length}`);
  if (content.length !== 3) issues.push(`Expected 3 content steps, got ${content.length}`);
  if (quiz.length !== 3) issues.push(`Expected 3 quiz steps, got ${quiz.length}`);
  if (!lesson.cambridgeStage.includes("KS1")) issues.push(`Expected KS1, got ${lesson.cambridgeStage}`);
  if (lesson.estimatedMinutes < 8 || lesson.estimatedMinutes > 15)
    issues.push(`Unusual estimatedMinutes: ${lesson.estimatedMinutes}`);
  quiz.forEach((s, i) => {
    const q = s as { options?: unknown[]; correctAnswer?: unknown };
    if (!Array.isArray(q.options) || q.options.length !== 4)
      issues.push(`Quiz ${i + 1}: expected 4 options, got ${q.options?.length}`);
    if (typeof q.correctAnswer !== "number")
      issues.push(`Quiz ${i + 1}: correctAnswer must be a number`);
  });
  return issues;
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  eatutori — seed verification (all subjects)");
  console.log("═══════════════════════════════════════════════════\n");

  // ── 1. List all seeded prompts ───────────────────────────────
  const prompts = await prisma.subjectPrompt.findMany({
    where: { isActive: true },
    orderBy: [{ subjectId: "asc" }, { grade: "asc" }, { version: "asc" }],
  });

  if (prompts.length === 0) {
    console.error("❌ No prompts found. Run a seed first.");
    process.exit(1);
  }

  // Group by subject
  const bySubject = prompts.reduce<Record<string, typeof prompts>>((acc, p) => {
    const key = `${p.subjectId}:${p.grade}`;
    acc[key] = acc[key] ?? [];
    acc[key].push(p);
    return acc;
  }, {});

  console.log(`📦 Found ${prompts.length} active prompts across ${Object.keys(bySubject).length} subject/grade combos:\n`);
  for (const [key, group] of Object.entries(bySubject)) {
    const first = group[0];
    console.log(`  ${first.subjectName} · Grade ${first.grade} · ${first.cambridgeStage} — ${group.length} version(s)`);
    group.forEach((p) => console.log(`    v${p.version} · ${p.topicFocus} · ${p.difficultyHint}`));
    console.log();
  }

  // ── 2. Live generation test — one per subject/grade ──────────
  console.log("🤖 Running live generation test (v1 of each subject)...\n");

  let passed = 0;
  let failed = 0;

  for (const [, group] of Object.entries(bySubject)) {
    const prompt = group[0]; // test v1
    process.stdout.write(`  Testing ${prompt.subjectId} grade ${prompt.grade} v${prompt.version}... `);

    try {
      const result = await testGeneration(prompt);
      if (!result) { console.log("skipped"); continue; }

      const issues = validateLesson(result.lesson);
      if (issues.length === 0) {
        console.log(`✅ "${result.lesson.title}" (${result.elapsed}ms)`);
        passed++;
      } else {
        console.log(`⚠️  shape issues:`);
        issues.forEach((i) => console.log(`     • ${i}`));
        failed++;
      }
    } catch (e) {
      console.log(`❌ ${(e as Error).message}`);
      failed++;
    }
  }

  // ── 3. Summary ───────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed · ${failed} failed`);
  if (failed === 0) {
    console.log("  ✅ All subjects verified and ready!");
  } else {
    console.log("  ⚠️  Some subjects need attention — check prompt output rules.");
  }
  console.log("═══════════════════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error("❌ Verification failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
