import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Testing Anthropic API connection...");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testConnection() {
  console.log("API Key length:", process.env.ANTHROPIC_API_KEY?.length);
  console.log(
    "API Key starts with:",
    process.env.ANTHROPIC_API_KEY?.substring(0, 10)
  );

  try {
    // Try to make a simple request to test the connection
    console.log("\n🔄 Testing API connection...");

    // Let's try the models endpoint if it exists
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);
    const data = await response.text();
    console.log("Response:", data.substring(0, 500));
  } catch (error) {
    console.error("Connection test failed:", error.message);
  }

  // Try the oldest known working model from the conversation
  try {
    console.log("\n🔄 Trying conversation history working model...");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // This was in the old code
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    });

    console.log("✅ SUCCESS with claude-sonnet-4-20250514!");
    console.log("Response:", response.content[0].text);
  } catch (error) {
    console.log(
      "❌ claude-sonnet-4-20250514:",
      error.status,
      "-",
      error.error?.error?.message
    );
  }
}

testConnection();
