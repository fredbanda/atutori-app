// test-voice-rate-limiting.js
// Test script to verify rate limiting and caching works

console.log("🎤 Testing Voice Rate Limiting & Caching");
console.log("=======================================");

const testTexts = [
  "Let's learn about numbers",
  "Count from 1 to 5",
  "Let's learn about numbers", // Duplicate to test caching
  "What color is this shape?",
  "Great job counting!",
  "Let's learn about numbers", // Another duplicate
  "Now let's try addition",
];

async function testVoiceSystem() {
  console.log(`\n📝 Testing ${testTexts.length} text enhancements...`);
  console.log("⏱️  Watch for caching and rate limiting messages\n");

  try {
    for (let i = 0; i < testTexts.length; i++) {
      const text = testTexts[i];
      const startTime = Date.now();

      console.log(`${i + 1}. "${text}"`);

      const response = await fetch("http://localhost:3000/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speed: 0.85 }),
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      if (result.fallbackText) {
        console.log(`   ✅ Enhanced: "${result.fallbackText.slice(0, 50)}..."`);
      } else {
        console.log(`   ⚠️  No enhancement (fallback mode)`);
      }

      console.log(`   ⏱️  Took: ${duration}ms\n`);

      // Small delay between requests for readability
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("🎯 Test Results:");
    console.log("- Check console for 'Using cached enhanced text' messages");
    console.log("- Check for 'Rate limiting: waiting Xms...' messages");
    console.log("- Duplicate texts should be much faster (cached)");
    console.log("- API errors should trigger retries with backoff");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Set environment variable and run test
process.env.NEXT_PUBLIC_GEMINI_API_KEY =
  "AIzaSyD11ikgg37M-8YsYrwdI0zItvTS924Q6iA";
process.env.VOICE_PROVIDER = "gemini";

testVoiceSystem();
