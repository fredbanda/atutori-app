// Test script to verify lesson generation and Redis caching
const { generateLesson } = require("./lib/generate-lesson.ts");

async function testLessonGeneration() {
  console.log("🧪 Testing lesson generation...");

  try {
    const lesson = await generateLesson("primary-early", "1", "test-user-123");
    console.log("✅ Lesson generation successful!");
    console.log("📚 Generated lesson:", {
      title: lesson.title,
      steps: lesson.steps.length,
      hasQuiz: lesson.quiz ? lesson.quiz.questions.length : 0,
    });
  } catch (error) {
    console.error("❌ Lesson generation failed:", error);
    console.error("📋 Error details:", error.message);
    if (error.stack) {
      console.error("📍 Stack trace:", error.stack);
    }
  }
}

testLessonGeneration();
