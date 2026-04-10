// test-gemini-model.js
// Quick test to verify Gemini 2.5 Flash model works with your API key

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

console.log("🔍 Testing Gemini 2.5 Flash Model");
console.log("================================");

async function testGeminiModel() {
  try {
    console.log("📡 Connecting to Gemini API...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("✨ Generating enhanced text...");
    const testText = "Let's learn about numbers";

    const prompt = `Make this educational text perfect for a 6-year-old child:
"${testText}"

Make it exciting, engaging, and use simple words.
Keep the same meaning but make it more conversational and fun.
Return only the enhanced text, nothing else.`;

    const result = await model.generateContent(prompt);
    const enhanced = result.response.text().trim();

    console.log("\n📝 Results:");
    console.log(`Original: "${testText}"`);
    console.log(`Enhanced: "${enhanced}"`);

    console.log("\n✅ SUCCESS: Gemini 2.5 Flash is working!");
    console.log("🎤 Voice enhancement will now work properly.");
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);

    if (error.message.includes("404")) {
      console.log("\n💡 Model not found. Available alternatives:");
      console.log("   - gemini-1.5-pro");
      console.log("   - gemini-1.5-flash");
      console.log("   - gemini-pro");
    }

    if (error.message.includes("API")) {
      console.log("\n🔑 Check your API key:");
      console.log(
        "   NEXT_PUBLIC_GEMINI_API_KEY=",
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "✅ Set" : "❌ Missing"
      );
    }
  }
}

testGeminiModel();
