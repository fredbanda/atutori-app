import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Testing latest Claude models...");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testLatestModels() {
  // Try the newest possible model names based on the pattern
  const latestModels = [
    "claude-3-5-sonnet-20250101", // Hypothetical 2025 model
    "claude-3-5-sonnet-20241201", // Hypothetical December 2024
    "claude-3-5-sonnet-latest", // Try latest alias
    "claude-3-5-sonnet", // Try without date
    "claude-4", // Maybe Claude 4 exists?
    "claude-3-5-haiku-20241201", // Newer Haiku
    "claude-3-5-opus-20241022", // Maybe Opus got updated
  ];

  for (const model of latestModels) {
    try {
      console.log(`\n🔄 Testing ${model}...`);

      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 20,
        messages: [
          {
            role: "user",
            content: "Hello",
          },
        ],
      });

      console.log(`🎉 FOUND WORKING MODEL: ${model}`);
      console.log("Response:", response.content[0].text);
      console.log(`\n✅ Use this model in your app: "${model}"`);
      return model;
    } catch (error) {
      console.log(
        `❌ ${model}: ${error.status} - ${
          error.error?.error?.message || error.message
        }`
      );
    }
  }

  console.log(
    "\n🤔 All tested models failed. Let me suggest checking the Anthropic docs..."
  );
}

testLatestModels();
