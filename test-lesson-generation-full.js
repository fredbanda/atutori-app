// Import the actual lesson generation function
require("dotenv").config();

async function testLessonGeneration() {
  console.log("🎓 Testing AI lesson generation...\n");

  try {
    // Import the function from our TypeScript file
    const { generateLesson } = require("./lib/generate-lesson.ts");

    console.log("📚 Generating lesson for primary-early, subject 1...");

    const startTime = Date.now();
    const lesson = await generateLesson("primary-early", "1", "test-user-123");
    const endTime = Date.now();

    console.log("✅ Lesson generation successful!");
    console.log(`⏱️ Generation time: ${endTime - startTime}ms`);
    console.log("📖 Lesson details:");
    console.log(`   Title: ${lesson.title}`);
    console.log(`   Steps: ${lesson.steps.length}`);
    console.log(
      `   Quiz questions: ${lesson.quiz ? lesson.quiz.questions.length : 0}`
    );

    // Test caching by generating the same lesson again
    console.log("\n🔄 Testing cache retrieval...");
    const cacheStartTime = Date.now();
    const cachedLesson = await generateLesson(
      "primary-early",
      "1",
      "test-user-123"
    );
    const cacheEndTime = Date.now();

    console.log("✅ Cache retrieval successful!");
    console.log(`⏱️ Cache retrieval time: ${cacheEndTime - cacheStartTime}ms`);
    console.log(
      `📊 Speed improvement: ${Math.round(
        ((endTime - startTime) / (cacheEndTime - cacheStartTime)) * 100
      )}% faster`
    );

    // Verify the cached lesson is the same
    if (lesson.title === cachedLesson.title) {
      console.log("✅ Cache consistency verified - titles match");
    } else {
      console.log("⚠️ Cache inconsistency - titles differ");
    }
  } catch (error) {
    console.error("❌ Lesson generation failed:");
    console.error("📋 Error message:", error.message);

    if (error.stack) {
      console.error("📍 Stack trace:");
      console.error(error.stack);
    }
  }
}

testLessonGeneration();
