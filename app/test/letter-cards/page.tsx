"use client";

import { useState } from "react";
import LetterCard from "../../../components/eatutori/LetterCard";
import LetterSequence from "../../../components/eatutori/LetterSequence";

export default function LetterCardsTest() {
  const [showDemo, setShowDemo] = useState(false);
  const [demoMode, setDemoMode] = useState<"single" | "sequence">("single");
  const [currentLetter, setCurrentLetter] = useState("A");
  const [gradeDifficulty, setGradeDifficulty] = useState<1 | 2 | 3>(1);
  const [showPhonics, setShowPhonics] = useState(true);
  const [showWords, setShowWords] = useState(true);

  const handleLetterComplete = () => {
    // For single letter demo, cycle through A-E
    const letters = ["A", "B", "C", "D", "E"];
    const currentIndex = letters.indexOf(currentLetter);
    const nextIndex = (currentIndex + 1) % letters.length;

    setTimeout(() => {
      setCurrentLetter(letters[nextIndex]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔤 LetterCards Demo
          </h1>
          <p className="text-lg text-gray-600">
            Revolutionary phonics learning for grades K-3
          </p>

          {!showDemo && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setDemoMode("single");
                    setShowDemo(true);
                  }}
                  className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-purple-700 transition-colors"
                >
                  📝 Single Letter Demo
                </button>
                <button
                  onClick={() => {
                    setDemoMode("sequence");
                    setShowDemo(true);
                  }}
                  className="px-8 py-4 bg-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-pink-700 transition-colors"
                >
                  🔤 Alphabet Sequence
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo Section */}
        {showDemo && (
          <div className="flex flex-col items-center">
            {/* Demo Mode Switcher */}
            <div className="mb-6 flex gap-2 bg-white rounded-lg p-2 shadow-md">
              <button
                onClick={() => setDemoMode("single")}
                className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                  demoMode === "single"
                    ? "bg-purple-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Single Letter
              </button>
              <button
                onClick={() => setDemoMode("sequence")}
                className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                  demoMode === "sequence"
                    ? "bg-pink-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Alphabet Sequence
              </button>
            </div>

            {/* Settings */}
            <div className="mb-6 flex gap-4 flex-wrap justify-center items-center bg-white p-4 rounded-lg shadow-md">
              {/* Grade Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Grade:
                </label>
                <select
                  value={gradeDifficulty}
                  onChange={(e) =>
                    setGradeDifficulty(Number(e.target.value) as 1 | 2 | 3)
                  }
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value={1}>Grade 1 (Slower)</option>
                  <option value={2}>Grade 2 (Medium)</option>
                  <option value={3}>Grade 3 (Faster)</option>
                </select>
              </div>

              {/* Feature Toggles */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="phonics"
                  checked={showPhonics}
                  onChange={(e) => setShowPhonics(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="phonics"
                  className="text-sm font-medium text-gray-700"
                >
                  Phonics Sounds
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="words"
                  checked={showWords}
                  onChange={(e) => setShowWords(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="words"
                  className="text-sm font-medium text-gray-700"
                >
                  Example Words
                </label>
              </div>

              {/* Letter Selector for Single Mode */}
              {demoMode === "single" && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Letter:
                  </label>
                  <select
                    value={currentLetter}
                    onChange={(e) => setCurrentLetter(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                      <option key={letter} value={letter}>
                        {letter}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Demo Content */}
            {demoMode === "single" ? (
              <LetterCard
                key={`${currentLetter}-${gradeDifficulty}-${showPhonics}-${showWords}`}
                letter={currentLetter}
                gradeDifficulty={gradeDifficulty}
                showPhonics={showPhonics}
                showWords={showWords}
                onComplete={handleLetterComplete}
              />
            ) : (
              <LetterSequence
                key={`${gradeDifficulty}-${showPhonics}-${showWords}`}
                startLetter="A"
                endLetter="E" // Short demo sequence
                gradeDifficulty={gradeDifficulty}
                showPhonics={showPhonics}
                showWords={showWords}
                autoProgress={true}
                onSequenceComplete={() => {
                  alert("Amazing! You completed A-E! 🎉");
                }}
              />
            )}

            {/* Reset Demo */}
            <div className="mt-8">
              <button
                onClick={() => {
                  setShowDemo(false);
                  setCurrentLetter("A");
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                🔄 Back to Menu
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        {!showDemo && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">🗣️</div>
              <h3 className="font-semibold mb-2">Phonics Learning</h3>
              <p className="text-gray-600">
                Master letter sounds with proper pronunciation
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold mb-2">Word Building</h3>
              <p className="text-gray-600">
                Connect letters to real words with visual examples
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Grade Adaptive</h3>
              <p className="text-gray-600">
                Speed adjusts automatically for Grades 1-3
              </p>
            </div>
          </div>
        )}

        {/* Learning Flow Explanation */}
        {!showDemo && (
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-6">
              See → Hear → Phonics → Say → Trace → Word → Master
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">👀</div>
                <div className="font-semibold text-sm">See</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🔊</div>
                <div className="font-semibold text-sm">Hear</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🗣️</div>
                <div className="font-semibold text-sm">Phonics</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">📢</div>
                <div className="font-semibold text-sm">Say</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-2">✍️</div>
                <div className="font-semibold text-sm">Trace</div>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-semibold text-sm">Word</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl mb-2">✅</div>
                <div className="font-semibold text-sm">Master</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
