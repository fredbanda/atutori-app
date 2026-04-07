// Use CommonJS to import TypeScript files
const { generateLesson } = require("./lib/generate-lesson.ts");

console.log("🔧 Quick lesson generation test...");

async function quickTest() {
  try {
    console.log("📊 Testing lesson generation with working Claude model...");

    const result = await generateLesson(
      1, // grade
      "counting", // subjectId
      1, // version
      true // forceRegenerate
    );

    console.log("✅ SUCCESS! Lesson generated:", {
      fromCache: result.fromCache,
      version: result.version,
      isLastLesson: result.isLastLesson,
      stepCount: result.lesson.steps?.length || 0,
      hasTitle: !!result.lesson.title,
      hasObjective: !!result.lesson.objective,
    });

    console.log("🎉 LESSON GENERATION IS WORKING!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("Error details:", error);
  }
}

quickTest();
