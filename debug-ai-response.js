// Quick script to debug AI responses
const { generateLesson } = require("./lib/generate-lesson");

async function debugLesson(grade, subjectId) {
  try {
    console.log(`\n🧪 Testing Grade ${grade} - Subject: ${subjectId}`);
    const result = await generateLesson(grade, subjectId);
    console.log(`✅ Success: ${result.lesson.steps.length} steps generated`);
    console.log(
      "Steps:",
      result.lesson.steps.map(
        (s, i) => `${i + 1}. ${s.type} - ${s.title || "No title"}`
      )
    );
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Testing AI Lesson Generation...\n");

  const tests = [
    { grade: 1, subject: "counting" },
    { grade: 1, subject: "math" },
    { grade: 1, subject: "addition-basic" },
    { grade: 1, subject: "shapes-patterns" },
  ];

  for (const test of tests) {
    await debugLesson(test.grade, test.subject);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s between tests
  }
}

runTests()
  .then(() => {
    console.log("\n🏁 Debug complete");
    process.exit(0);
  })
  .catch(console.error);
