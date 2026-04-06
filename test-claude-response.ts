// Simple test to see what Claude is returning
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic();

async function testClaudeResponse() {
  console.log("🧪 Testing Claude Response for Grade 1 counting...\n");

  // Get the counting prompt
  const prompt = await prisma.subjectPrompt.findFirst({
    where: {
      grade: 1,
      subjectId: "counting",
      isActive: true,
    },
  });

  if (!prompt) {
    console.error("❌ Counting prompt not found");
    return;
  }

  console.log("📋 Prompt found:");
  console.log("  Subject:", prompt.subjectId);
  console.log("  Quiz Count:", prompt.quizCount);
  console.log("  System Prompt Length:", prompt.systemPrompt.length);
  console.log("  User Prompt Length:", prompt.userPrompt.length);
  console.log("");

  console.log("📤 Sending to Claude...");
  const start = Date.now();

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: prompt.systemPrompt,
      messages: [{ role: "user", content: prompt.userPrompt }],
    });

    const elapsed = Date.now() - start;
    console.log(`⚡ Response received in ${elapsed}ms\n`);

    const rawText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    console.log("📥 Raw Claude Response:");
    console.log("━".repeat(60));
    console.log(rawText);
    console.log("━".repeat(60));
    console.log("");

    // Try to parse JSON
    console.log("🔧 Attempting to parse JSON...");
    try {
      const clean = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const lesson = JSON.parse(clean);

      console.log("✅ JSON parsed successfully!");
      console.log("  Title:", lesson.title || "undefined");
      console.log("  Steps:", lesson.steps?.length || 0);
      console.log(
        "  Content steps:",
        lesson.steps?.filter((s) => s.type === "content").length || 0
      );
      console.log(
        "  Quiz steps:",
        lesson.steps?.filter((s) => s.type === "quiz").length || 0
      );
    } catch (error) {
      console.error("❌ JSON parsing failed:", error.message);
    }
  } catch (error) {
    console.error("❌ Claude request failed:", error.message);
  }

  await prisma.$disconnect();
}

testClaudeResponse().catch(console.error);
