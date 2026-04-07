// scripts/verify-seed.ts
// Confirms seeds are in DB and does a live generation test
// Run: npx ts-node scripts/verify-seed.ts

import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic();

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  eatutori — seed verification");
  console.log("═══════════════════════════════════════════\n");

  // ── 1. Check DB records ──────────────────────
  console.log("📦 Checking SubjectPrompt records in DB...\n");

  const prompts = await prisma.subjectPrompt.findMany({
    where: { isActive: true },
    orderBy: [{ grade: "asc" }, { subjectId: "asc" }],
  });

  if (prompts.length === 0) {
    console.error("❌ No prompts found. Did the seed run successfully?");
    process.exit(1);
  }

  console.log(`Found ${prompts.length} active SubjectPrompt records:\n`);

  for (const p of prompts) {
    console.log(`  ✅ Grade ${p.grade} · ${p.cambridgeStage} · v${p.version}`);
    console.log(`     Subject:    ${p.subjectId} (${p.subjectName})`);
    console.log(`     Topic:      ${p.topicFocus}`);
    console.log(
      `     Structure:  ${p.contentSteps} content + ${p.quizCount} quiz`
    );
    console.log(`     Difficulty: ${p.difficultyHint}`);
    console.log(`     System prompt length: ${p.systemPrompt.length} chars`);
    console.log(`     User prompt length:   ${p.userPrompt.length} chars\n`);
  }

  // ── 2. Live generation test (Grade 1 counting) ──
  console.log("🤖 Testing live Claude generation for Grade 1 counting...\n");

  const prompt = prompts.find(
    (p) => p.grade === 1 && p.subjectId === "counting"
  );
  if (!prompt) {
    console.error("❌ Grade 1 'counting' prompt not found");
    console.log(
      "Available Grade 1 subjects:",
      prompts
        .filter((p) => p.grade === 1)
        .map((p) => p.subjectId)
        .join(", ")
    );
    process.exit(1);
  }

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

  // Parse
  let lesson: any;
  try {
    const clean = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const raw = JSON.parse(clean);
    // Normalize — same logic as generate-lesson.ts
    lesson = {
      title: raw.title ?? raw.lesson_title ?? "Lesson",
      cambridgeStage: ((raw.cambridgeStage ?? raw.curriculum_alignment ?? prompt.cambridgeStage) as string).includes("KS1") ? "KS1" : (raw.cambridgeStage ?? raw.curriculum_alignment ?? prompt.cambridgeStage),
      subject: raw.subject ?? prompt.subjectId,
      grade: raw.grade ?? prompt.grade,
      estimatedMinutes: raw.estimatedMinutes ?? 10,
      steps: ((raw.steps ?? []) as any[]).map((s: any) => {
        const stepType = s.type ?? s.step_type;
        if (stepType === "quiz") {
          return {
            type: "quiz",
            question: s.question,
            options: s.options,
            correctAnswer: s.correctAnswer ?? s.correct_answer ?? 0,
            explanation: s.explanation ?? "",
            hint: s.hint,
          };
        }
        return { type: "content", title: s.title ?? "", content: s.content ?? "", example: s.example ?? "" };
      }),
    };
  } catch {
    console.error("❌ Claude returned invalid JSON:");
    console.error(rawText.slice(0, 500));
    process.exit(1);
  }

  // ── 3. Validate lesson shape ─────────────────
  console.log(`  ⚡ Generated in ${elapsed}ms\n`);
  console.log(`  📖 Lesson title:   "${lesson.title}"`);
  console.log(`  🏫 Stage:          ${lesson.cambridgeStage}`);
  console.log(`  📚 Subject:        ${lesson.subject}`);
  console.log(`  🎓 Grade:          ${lesson.grade}`);
  console.log(`  ⏱  Est. minutes:   ${lesson.estimatedMinutes}`);
  console.log(`  📝 Total steps:    ${lesson.steps?.length ?? 0}\n`);

  const contentSteps =
    lesson.steps?.filter((s: any) => s.type === "content") ?? [];
  const quizSteps = lesson.steps?.filter((s: any) => s.type === "quiz") ?? [];

  console.log(`  Content steps (${contentSteps.length}):`);
  contentSteps.forEach((s: any, i: number) => {
    console.log(`    ${i + 1}. "${s.title}"`);
    console.log(`       ${s.content.slice(0, 80)}...`);
    console.log(`       Example: ${s.example.slice(0, 60)}...\n`);
  });

  console.log(`  Quiz steps (${quizSteps.length}):`);
  quizSteps.forEach((s: any, i: number) => {
    console.log(`    Q${i + 1}. ${s.question}`);
    s.options.forEach((opt: string, j: number) => {
      const marker = j === s.correctAnswer ? "✓" : " ";
      console.log(`         [${marker}] ${opt}`);
    });
    console.log(`         Explanation: ${s.explanation.slice(0, 70)}...`);
    if (s.hint) console.log(`         Hint: ${s.hint}`);
    console.log();
  });

  // ── 4. Shape validation ──────────────────────
  const issues: string[] = [];
  if (lesson.steps?.length !== 6)
    issues.push(`Expected 6 steps, got ${lesson.steps?.length}`);
  if (contentSteps.length !== 3)
    issues.push(`Expected 3 content steps, got ${contentSteps.length}`);
  if (quizSteps.length !== 3)
    issues.push(`Expected 3 quiz steps, got ${quizSteps.length}`);
  const stage = (lesson.cambridgeStage as string ?? "").includes("KS1") ? "KS1" : lesson.cambridgeStage;
  if (stage !== "KS1")
    issues.push(`Expected KS1, got ${lesson.cambridgeStage}`);
  if (lesson.estimatedMinutes < 10 || lesson.estimatedMinutes > 15)
    issues.push(`Expected 10-15 min, got ${lesson.estimatedMinutes}`);
  quizSteps.forEach((s: any, i: number) => {
    if (!Array.isArray(s.options) || s.options.length !== 4)
      issues.push(
        `Quiz ${i + 1}: expected 4 options, got ${s.options?.length}`
      );
    if (typeof s.correctAnswer !== "number")
      issues.push(`Quiz ${i + 1}: correctAnswer must be a number`);
  });

  console.log("═══════════════════════════════════════════");
  if (issues.length === 0) {
    console.log(
      "  ✅ All checks passed! Grade 1 curriculum verified and ready."
    );
    console.log("\n  Your comprehensive Grade 1 math curriculum includes:");
    const grade1Subjects = prompts
      .filter((p) => p.grade === 1)
      .map((p) => `    • ${p.subjectId} (${p.subjectName})`);
    grade1Subjects.forEach((subject) => console.log(subject));
    console.log("\n  Next steps:");
    console.log(
      "  → Test lesson generation: /api/test-lesson-generation?grade=1&subjectId=counting"
    );
    console.log("  → View Grade 1 math hub: /playground/primary-early/math");
    console.log(
      "  → Access individual lessons: /playground/primary-early/lesson/1"
    );
  } else {
    console.log("  ⚠️  Shape issues detected — review prompt output rules:");
    issues.forEach((issue) => console.log(`    • ${issue}`));
    console.log(
      "\n  The prompt may need tightening. Check OUTPUT_SCHEMA in the seed."
    );
  }
  console.log("═══════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

