"use client";

import { useState, useEffect } from "react";

interface SimpleNumberCardProps {
  number: number;
  showObjects?: boolean;
  objectType?: "apple" | "star" | "circle" | "square";
  onComplete?: () => void;
}

type LearningPhase = "see" | "hear" | "say" | "trace" | "complete";

export default function SimpleNumberCard({
  number,
  showObjects = false,
  objectType = "apple",
  onComplete,
}: SimpleNumberCardProps) {
  const [phase, setPhase] = useState<LearningPhase>("see");
  const [feedback, setFeedback] = useState<string>("");
  const [attempts, setAttempts] = useState(0);

  // Auto-start the learning sequence with proper voice timing
  useEffect(() => {
    if (phase === "see") {
      // Phase 1: See (2 seconds to look at the number)
      setTimeout(() => {
        setPhase("hear");
        speakWithBrowserTTS(
          `This is the number ${number}. You can see ${number} ${objectType}${
            number > 1 ? "s" : ""
          }.`
        );

        // Phase 2: Hear (wait for voice + pause = ~5 seconds)
        setTimeout(() => {
          setPhase("say");
          speakWithBrowserTTS(`Now you say: ${number}`);

          // Phase 3: Say (wait for voice + thinking time = ~4 seconds)
          setTimeout(() => {
            setPhase("trace");
            speakWithBrowserTTS("Excellent! You said it perfectly!");

            // Phase 4: Trace (wait for voice + practice time = ~4 seconds)
            setTimeout(() => {
              setPhase("complete");
              speakWithBrowserTTS("Great job! You learned this number!");

              // Phase 5: Complete (wait for voice + celebration = ~3 seconds)
              setTimeout(() => {
                onComplete?.();
              }, 3000);
            }, 4000);
          }, 4000);
        }, 5000);
      }, 2000);
    }
  }, [phase, number, objectType, onComplete]);

  // Simple browser TTS
  const speakWithBrowserTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.75;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Render objects for visual counting
  const renderObjects = () => {
    if (!showObjects) return null;

    const objects = [];
    for (let i = 0; i < number; i++) {
      objects.push(
        <div key={i} className="object">
          {objectType === "apple" && <span className="text-6xl">🍎</span>}
          {objectType === "star" && <span className="text-6xl">⭐</span>}
          {objectType === "circle" && (
            <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
          )}
          {objectType === "square" && (
            <div className="w-12 h-12 bg-red-500 rounded-md"></div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-4 mb-6 max-w-sm">
        {objects}
      </div>
    );
  };

  // Phase indicators
  const getPhaseColor = () => {
    switch (phase) {
      case "see":
        return "bg-blue-600";
      case "hear":
        return "bg-green-600";
      case "say":
        return "bg-yellow-500";
      case "trace":
        return "bg-purple-600";
      case "complete":
        return "bg-emerald-600";
      default:
        return "bg-gray-600";
    }
  };

  const getPhaseEmoji = () => {
    switch (phase) {
      case "see":
        return "👀";
      case "hear":
        return "🔊";
      case "say":
        return "🗣️";
      case "trace":
        return "✍️";
      case "complete":
        return "✅";
      default:
        return "📚";
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case "see":
        return "Look at the number";
      case "hear":
        return "Listen to the teacher";
      case "say":
        return "Practice saying the number";
      case "trace":
        return "Practice writing the number";
      case "complete":
        return "Lesson complete!";
      default:
        return "Learning numbers";
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      {/* Phase Indicator */}
      <div className="mb-6 text-center">
        <div
          className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${getPhaseColor()} text-white text-lg font-semibold shadow-lg transition-all duration-500`}
        >
          <span className="text-2xl">{getPhaseEmoji()}</span>
          {getPhaseText()}
        </div>
      </div>

      {/* Main Learning Card */}
      <div
        className={`w-[400px] h-[400px] ${getPhaseColor()} rounded-3xl flex flex-col items-center justify-center shadow-xl transition-all duration-500 transform ${
          phase === "say" ? "scale-105 ring-4 ring-yellow-300" : ""
        }`}
      >
        {/* Objects for counting (if enabled) */}
        {renderObjects()}

        {/* Big Number */}
        <span className="text-white text-[180px] font-extrabold leading-none select-none">
          {number}
        </span>

        {/* Phase-specific guidance */}
        <div className="text-center mt-4 px-4">
          {phase === "say" && (
            <p className="text-white text-xl font-semibold">Say: "{number}"</p>
          )}

          {phase === "trace" && (
            <div className="text-white">
              <p className="text-lg mb-2">Now practice tracing!</p>
              <div className="text-6xl opacity-50 font-thin">{number}</div>
            </div>
          )}

          {phase === "complete" && (
            <div className="text-white text-center">
              <p className="text-2xl mb-2">🎉 Amazing work!</p>
              <p className="text-lg">You learned the number {number}!</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex gap-2">
        {["see", "hear", "say", "trace"].map((stepPhase, index) => (
          <div
            key={stepPhase}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              phase === stepPhase || phase === "complete"
                ? "bg-green-500 scale-125"
                : index < ["see", "hear", "say", "trace"].indexOf(phase)
                ? "bg-green-400"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
