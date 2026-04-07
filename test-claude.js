import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log("Testing Claude API...");

async function testClaude() {
  const models = [
    "claude-3-5-sonnet",
    "claude-3-sonnet",
    "claude-3-haiku",
    "claude-3-opus",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-latest",
    "claude-3-sonnet-20240229",
    "claude-3-5-sonnet-20240620",
    "claude-3-haiku-20240307",
    "claude-3-opus-20240229",
  ];

  for (const model of models) {
    try {
      console.log(`🔄 Testing model: ${model}`);

      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: "Hello! Please respond with just the number 42.",
          },
        ],
      });

      console.log(`✅ SUCCESS with ${model}!`);
      console.log("Response:", response.content[0].text);
      return model; // Return first working model
    } catch (error) {
      console.log(`❌ Failed with ${model}: ${error.message}`);
    }
  }

  console.log("❌ No working models found!");
}

testClaude();
