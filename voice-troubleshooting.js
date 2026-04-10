// voice-troubleshooting.js
// Debug script to check voice functionality

console.log("🎤 Voice Troubleshooting Guide");
console.log("================================");

// 1. Check if browser supports audio
console.log("\n1. Browser Audio Support:");
try {
  const audio = new Audio();
  console.log("✅ Audio constructor available");

  // Test basic audio playback
  const testAudio = new Audio(
    "data:audio/mp3;base64,SUQzBAAAAAAAI1RTARVBUE9BAAAADwAAAABIZWxsbyB3b3JsZEQGAAAA"
  );
  testAudio
    .play()
    .then(() => {
      console.log("✅ Browser can play audio");
    })
    .catch((err) => {
      console.log("❌ Browser audio blocked:", err.message);
      console.log(
        "💡 Solution: User must interact with page first (click something)"
      );
    });
} catch (error) {
  console.log("❌ Audio not supported:", error.message);
}

// 2. Check voice integration
console.log("\n2. Voice Integration Check:");
console.log(
  "OpenAI TTS integration:",
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_OPENAI_API_KEY
    ? "✅ Available"
    : "❌ Missing API key"
);

// 3. Check permissions
console.log("\n3. Audio Permissions:");
navigator.permissions
  .query({ name: "microphone" })
  .then((permission) => {
    console.log("Microphone permission:", permission.state);
  })
  .catch(() => {
    console.log("Microphone permission: Not available in this browser");
  });

// 4. Check autoplay policy
console.log("\n4. Autoplay Policy:");
if (typeof document !== "undefined") {
  document.addEventListener(
    "click",
    () => {
      console.log("✅ User has interacted - audio should work now");
    },
    { once: true }
  );
}

console.log("\n🔧 Common Issues & Solutions:");
console.log("1. No sound:");
console.log("   - Check browser volume");
console.log("   - Click anywhere on page first (autoplay policy)");
console.log("   - Check if voice button is muted");

console.log("\n2. Voice not loading:");
console.log("   - Check OpenAI API key in environment");
console.log("   - Check network connection");
console.log("   - Look for errors in browser console");

console.log("\n3. In Gemini Live mode:");
console.log("   - Check NEXT_PUBLIC_GEMINI_API_KEY is set");
console.log("   - Ensure microphone permissions granted");
console.log("   - Check browser supports WebRTC");

console.log("\n🎯 Quick Test:");
console.log("1. Click any button on the page");
console.log("2. Click the voice button (speaker icon)");
console.log("3. Listen for audio playback");
console.log("4. Check browser dev tools for errors");
