"use client";

import { useState, useEffect } from "react";

interface LetterCardProps {
  letter: string;
  showPhonics?: boolean;
  showWords?: boolean;
  gradeDifficulty?: 1 | 2 | 3;
  onComplete?: () => void;
}

type LetterPhase =
  | "see"
  | "hear"
  | "say"
  | "phonics"
  | "trace"
  | "word"
  | "complete";

const letterExamples: Record<
  string,
  { word: string; emoji: string; phonics: string }
> = {
  A: { word: "Apple", emoji: "🍎", phonics: "/æ/" },
  B: { word: "Ball", emoji: "⚽", phonics: "/b/" },
  C: { word: "Cat", emoji: "🐱", phonics: "/k/" },
  D: { word: "Dog", emoji: "🐶", phonics: "/d/" },
  E: { word: "Egg", emoji: "🥚", phonics: "/e/" },
  F: { word: "Fish", emoji: "🐟", phonics: "/f/" },
  G: { word: "Goat", emoji: "🐐", phonics: "/g/" },
  H: { word: "Hat", emoji: "👒", phonics: "/h/" },
  I: { word: "Ice", emoji: "🧊", phonics: "/ɪ/" },
  J: { word: "Jam", emoji: "🍯", phonics: "/dʒ/" },
  K: { word: "Key", emoji: "🔑", phonics: "/k/" },
  L: { word: "Lion", emoji: "🦁", phonics: "/l/" },
  M: { word: "Moon", emoji: "🌙", phonics: "/m/" },
  N: { word: "Net", emoji: "🥅", phonics: "/n/" },
  O: { word: "Orange", emoji: "🍊", phonics: "/ɒ/" },
  P: { word: "Pig", emoji: "🐷", phonics: "/p/" },
  Q: { word: "Queen", emoji: "👸", phonics: "/kw/" },
  R: { word: "Rabbit", emoji: "🐰", phonics: "/r/" },
  S: { word: "Sun", emoji: "☀️", phonics: "/s/" },
  T: { word: "Tree", emoji: "🌳", phonics: "/t/" },
  U: { word: "Umbrella", emoji: "☂️", phonics: "/ʌ/" },
  V: { word: "Van", emoji: "🚐", phonics: "/v/" },
  W: { word: "Water", emoji: "💧", phonics: "/w/" },
  X: { word: "Box", emoji: "📦", phonics: "/ks/" },
  Y: { word: "Yellow", emoji: "💛", phonics: "/j/" },
  Z: { word: "Zebra", emoji: "🦓", phonics: "/z/" },
};

export default function LetterCard({
  letter,
  showPhonics = true,
  showWords = true,
  gradeDifficulty = 1,
  onComplete,
}: LetterCardProps) {
  const [phase, setPhase] = useState<LetterPhase>("see");
  const [feedback, setFeedback] = useState<string>("");
  const [currentExample, setCurrentExample] = useState(
    letterExamples[letter.toUpperCase()]
  );

  // Pause between phases so the child has time to respond
  const pauseMs = gradeDifficulty === 1 ? 1500 : gradeDifficulty === 2 ? 1200 : 1000;

  // Auto-start the letter learning sequence
  useEffect(() => {
    if (phase !== "see") return;
    let cancelled = false;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 800)); // brief "see" pause
      if (cancelled) return;

      setPhase("hear");
      await speakWithBrowserTTS(
        `This is the letter ${letter.toUpperCase()}. Look at this beautiful letter ${letter.toUpperCase()}!`
      );
      if (cancelled) return;

      if (showPhonics) {
        setPhase("phonics");
        await speakWithBrowserTTS(
          `The letter ${letter.toUpperCase()} makes the sound ${currentExample.phonics}. Listen: ${currentExample.phonics}`
        );
        if (cancelled) return;
      }

      setPhase("say");
      await speakWithBrowserTTS(`Now you say the letter: ${letter.toUpperCase()}`);
      await new Promise((r) => setTimeout(r, pauseMs)); // child echo pause
      if (cancelled) return;

      setPhase("trace");
      await speakWithBrowserTTS("Excellent! Now practice tracing the letter with your finger!");
      await new Promise((r) => setTimeout(r, pauseMs));
      if (cancelled) return;

      if (showWords) {
        setPhase("word");
        await speakWithBrowserTTS(
          `${letter.toUpperCase()} is for ${currentExample.word}! Can you say ${currentExample.word}?`
        );
        await new Promise((r) => setTimeout(r, pauseMs));
        if (cancelled) return;
      }

      setPhase("complete");
      await speakWithBrowserTTS(`Amazing work! You learned the letter ${letter.toUpperCase()}!`);
      if (!cancelled) onComplete?.();
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter]);

  // Browser TTS — returns a Promise that resolves when speech ends
  const speakWithBrowserTTS = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      speechSynthesis.cancel(); // stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = gradeDifficulty === 1 ? 0.7 : gradeDifficulty === 2 ? 0.8 : 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  };

  // Phase colors and indicators
  const getPhaseColor = () => {
    switch (phase) {
      case "see":
        return "bg-blue-600";
      case "hear":
        return "bg-green-600";
      case "phonics":
        return "bg-purple-600";
      case "say":
        return "bg-yellow-500";
      case "trace":
        return "bg-orange-500";
      case "word":
        return "bg-pink-600";
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
      case "phonics":
        return "🗣️";
      case "say":
        return "📢";
      case "trace":
        return "✍️";
      case "word":
        return "📝";
      case "complete":
        return "✅";
      default:
        return "📚";
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case "see":
        return "Look at the letter";
      case "hear":
        return "Listen to the teacher";
      case "phonics":
        return "Learn the sound";
      case "say":
        return "Say the letter";
      case "trace":
        return "Trace the letter";
      case "word":
        return "Learn a word";
      case "complete":
        return "Letter mastered!";
      default:
        return "Learning letters";
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
          phase === "say" || phase === "phonics"
            ? "scale-105 ring-4 ring-yellow-300"
            : ""
        }`}
      >
        {/* Letter Display */}
        <div className="text-center">
          {/* Big Letter */}
          <div className="mb-4">
            <span className="text-white text-[180px] font-extrabold leading-none select-none font-serif">
              {letter.toUpperCase()}
            </span>
          </div>

          {/* Phonics Display */}
          {(phase === "phonics" || phase === "word") && showPhonics && (
            <div className="mb-4">
              <div className="text-white text-4xl font-bold opacity-90">
                {currentExample.phonics}
              </div>
              <div className="text-white text-lg opacity-75">Letter sound</div>
            </div>
          )}

          {/* Word Example */}
          {phase === "word" && showWords && (
            <div className="text-center">
              <div className="text-8xl mb-2">{currentExample.emoji}</div>
              <div className="text-white text-3xl font-bold">
                {currentExample.word}
              </div>
              <div className="text-white text-lg opacity-75">
                {letter.toUpperCase()} is for {currentExample.word}
              </div>
            </div>
          )}

          {/* Phase-specific guidance */}
          {phase === "say" && (
            <div className="text-white text-center">
              <p className="text-xl font-semibold">
                Say: "{letter.toUpperCase()}"
              </p>
            </div>
          )}

          {phase === "trace" && (
            <div className="text-white text-center">
              <p className="text-lg mb-2">Trace with your finger!</p>
              <div className="text-8xl opacity-50 font-thin">
                {letter.toUpperCase()}
              </div>
            </div>
          )}

          {phase === "complete" && (
            <div className="text-white text-center">
              <p className="text-2xl mb-2">🎉 Fantastic!</p>
              <p className="text-lg">You learned {letter.toUpperCase()}!</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex gap-2">
        {[
          "see",
          "hear",
          ...(showPhonics ? ["phonics"] : []),
          "say",
          "trace",
          ...(showWords ? ["word"] : []),
        ].map((stepPhase, index) => (
          <div
            key={stepPhase}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              phase === stepPhase || phase === "complete"
                ? "bg-green-500 scale-125"
                : index <
                  [
                    "see",
                    "hear",
                    ...(showPhonics ? ["phonics"] : []),
                    "say",
                    "trace",
                    ...(showWords ? ["word"] : []),
                  ].indexOf(phase)
                ? "bg-green-400"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Grade indicator */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          Grade {gradeDifficulty} •{" "}
          {showPhonics ? "With Phonics" : "No Phonics"} •{" "}
          {showWords ? "With Words" : "Letters Only"}
        </div>
      </div>
    </div>
  );
}
