"use client";

import { VoicePlayer } from "@/components/voice-player";

export default function VoiceTestPage() {
  const testTexts = [
    "Hello! Let's learn about numbers together!",
    "Can you count from 1 to 5? Here we go: 1, 2, 3, 4, 5!",
    "Great job! Now let's practice shapes. This is a circle.",
    "Mathematics is fun when we learn together!",
  ];

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎤 Voice System Test
      </h1>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="text-blue-700">
          <strong>How it works:</strong> First tries Gemini-enhanced text with
          OpenAI TTS, then falls back to browser TTS if OpenAI quota is
          exceeded.
        </p>
      </div>

      <div className="space-y-6">
        {testTexts.map((text, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
            <p className="text-gray-700 mb-3 font-medium">
              Test {index + 1}: {text}
            </p>

            <VoicePlayer
              text={text}
              speed={0.85}
              onStart={() => console.log(`Started playing: ${text}`)}
              onEnd={() => console.log(`Finished playing: ${text}`)}
            >
              {({ isPlaying, speak, stop }) => (
                <div className="flex items-center gap-3">
                  <button
                    onClick={speak}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isPlaying
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {isPlaying ? <>🔇 Stop</> : <>🔊 Speak</>}
                  </button>

                  {isPlaying && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-pulse mr-2">🎵</div>
                      <span className="text-sm">Playing enhanced voice...</span>
                    </div>
                  )}
                </div>
              )}
            </VoicePlayer>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">
          ✅ What happens now:
        </h3>
        <ul className="text-green-700 space-y-1 text-sm">
          <li>1. Text gets enhanced by Gemini AI to be more child-friendly</li>
          <li>2. If OpenAI TTS works → High-quality audio</li>
          <li>3. If OpenAI quota exceeded → Browser TTS with enhanced text</li>
          <li>4. Fallback ensures voice always works!</li>
        </ul>
      </div>
    </div>
  );
}
