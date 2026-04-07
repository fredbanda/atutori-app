import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testSimpleModels() {
  // Try the current available model names (April 2026)
  const basicModels = [
    "claude-3-5-sonnet-20241022", // Latest Sonnet
    "claude-3-5-haiku-20241022", // Latest Haiku
    "claude-3-opus-20240229", // Opus (deprecated but might still work)
    "claude-3-haiku-20240307", // Older Haiku
    "claude-3-sonnet-20240229", // Older Sonnet
  ];

  for (const model of basicModels) {
    try {
      console.log(`\n🔄 Testing ${model}...`);

      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 20,
        messages: [
          {
            role: "user",
            content: "Say hello",
          },
        ],
      });

      console.log(`✅ SUCCESS! ${model} works!`);
      console.log("Response:", response.content[0].text);
      return model; // Return the first working model
    } catch (error) {
      if (error.status === 404) {
        console.log(`❌ ${model}: Model not found (404)`);
      } else {
        console.log(`❌ ${model}: ${error.message}`);
      }
    }
  }

  console.log(
    "\n❌ No working models found. This API key may not have access to any models."
  );
  console.log(
    "💡 Suggestion: Check your Anthropic account and API key permissions."
  );
}

console.log("🔍 Testing basic Claude models...");
testSimpleModels();
