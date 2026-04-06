// scripts/verify-seed.ts
// Confirms seeds are in DB and does a live generation test
// Run: npx ts-node scripts/verify-seed.ts

import { PrismaClient } from "@prisma/client"
import Anthropic from "@anthropic-ai/sdk"

const prisma = new PrismaClient()
const anthropic = new Anthropic()

async function main() {
  console.log("═══════════════════════════════════════════")
  console.log("  eatutori — seed verification")
  console.log("═══════════════════════════════════════════\n")

  // ── 1. Check DB records ──────────────────────
  console.log("📦 Checking SubjectPrompt records in DB...\n")

  const prompts = await prisma.subjectPrompt.findMany({
    where: { subjectId: "math", isActive: true },
    orderBy: { grade: "asc" },
  })

  if (prompts.length === 0) {
    console.error("❌ No prompts found. Did the seed run successfully?")
    process.exit(1)
  }

  for (const p of prompts) {
    console.log(`  ✅ Grade ${p.grade} · ${p.cambridgeStage} · v${p.version}`)
    console.log(`     Topic:      ${p.topicFocus}`)
    console.log(`     Structure:  ${p.contentSteps} content + ${p.quizCount} quiz`)
    console.log(`     Difficulty: ${p.difficultyHint}`)
    console.log(`     System prompt length: ${p.systemPrompt.length} chars`)
    console.log(`     User prompt length:   ${p.userPrompt.length} chars\n`)
  }

  // ── 2. Live generation test (Grade 1 only) ──
  console.log("🤖 Testing live Claude generation for Grade 1...\n")

  const prompt = prompts.find((p) => p.grade === 1)
  if (!prompt) {
    console.error("❌ Grade 1 prompt not found")
    process.exit(1)
  }

  const start = Date.now()

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: prompt.systemPrompt,
    messages: [{ role: "user", content: prompt.userPrompt }],
  })

  const elapsed = Date.now() - start

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("")

  // Parse
  let lesson: any
  try {
    const clean = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()
    lesson = JSON.parse(clean)
  } catch {
    console.error("❌ Claude returned invalid JSON:")
    console.error(rawText.slice(0, 500))
    process.exit(1)
  }

  // ── 3. Validate lesson shape ─────────────────
  console.log(`  ⚡ Generated in ${elapsed}ms\n`)
  console.log(`  📖 Lesson title:   "${lesson.title}"`)
  console.log(`  🏫 Stage:          ${lesson.cambridgeStage}`)
  console.log(`  📚 Subject:        ${lesson.subject}`)
  console.log(`  🎓 Grade:          ${lesson.grade}`)
  console.log(`  ⏱  Est. minutes:   ${lesson.estimatedMinutes}`)
  console.log(`  📝 Total steps:    ${lesson.steps?.length ?? 0}\n`)

  const contentSteps = lesson.steps?.filter((s: any) => s.type === "content") ?? []
  const quizSteps = lesson.steps?.filter((s: any) => s.type === "quiz") ?? []

  console.log(`  Content steps (${contentSteps.length}):`)
  contentSteps.forEach((s: any, i: number) => {
    console.log(`    ${i + 1}. "${s.title}"`)
    console.log(`       ${s.content.slice(0, 80)}...`)
    console.log(`       Example: ${s.example.slice(0, 60)}...\n`)
  })

  console.log(`  Quiz steps (${quizSteps.length}):`)
  quizSteps.forEach((s: any, i: number) => {
    console.log(`    Q${i + 1}. ${s.question}`)
    s.options.forEach((opt: string, j: number) => {
      const marker = j === s.correctAnswer ? "✓" : " "
      console.log(`         [${marker}] ${opt}`)
    })
    console.log(`         Explanation: ${s.explanation.slice(0, 70)}...`)
    if (s.hint) console.log(`         Hint: ${s.hint}`)
    console.log()
  })

  // ── 4. Shape validation ──────────────────────
  const issues: string[] = []
  if (lesson.steps?.length !== 6) issues.push(`Expected 6 steps, got ${lesson.steps?.length}`)
  if (contentSteps.length !== 3) issues.push(`Expected 3 content steps, got ${contentSteps.length}`)
  if (quizSteps.length !== 3) issues.push(`Expected 3 quiz steps, got ${quizSteps.length}`)
  if (lesson.cambridgeStage !== "KS1") issues.push(`Expected KS1, got ${lesson.cambridgeStage}`)
  if (lesson.estimatedMinutes !== 10) issues.push(`Expected 10 min, got ${lesson.estimatedMinutes}`)
  quizSteps.forEach((s: any, i: number) => {
    if (!Array.isArray(s.options) || s.options.length !== 4)
      issues.push(`Quiz ${i + 1}: expected 4 options, got ${s.options?.length}`)
    if (typeof s.correctAnswer !== "number")
      issues.push(`Quiz ${i + 1}: correctAnswer must be a number`)
  })

  console.log("═══════════════════════════════════════════")
  if (issues.length === 0) {
    console.log("  ✅ All checks passed! Ready to wire the lesson page.")
    console.log("\n  Next step:")
    console.log("  → Update your lesson page to call generateLesson(grade, subjectId)")
  } else {
    console.log("  ⚠️  Shape issues detected — review prompt output rules:")
    issues.forEach((issue) => console.log(`    • ${issue}`))
    console.log("\n  The prompt may need tightening. Check OUTPUT_SCHEMA in the seed.")
  }
  console.log("═══════════════════════════════════════════\n")
}

main()
  .catch((e) => {
    console.error("❌ Verification failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
