"use client";

import { useState } from "react";
import SimpleNumberCard from "../../../components/eatutori/SimpleNumberCard";

export default function SimpleNumberCardsTest() {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [showDemo, setShowDemo] = useState(false);
  const [autoProgress, setAutoProgress] = useState(true);

  const handleComplete = () => {
    // Only auto-progress if enabled
    if (!autoProgress) return;

    // Wait for the celebration to finish, then move to next number
    if (currentNumber < 10) {
      setTimeout(() => {
        setCurrentNumber(currentNumber + 1);
      }, 2000); // Give time for the celebration voice to finish
    } else {
      setTimeout(() => {
        setCurrentNumber(1); // Restart sequence
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔢 Simple Number Cards Demo
          </h1>
          <p className="text-lg text-gray-600">
            Revolutionary AI voice teacher for grades K-3
          </p>

          {!showDemo && (
            <button
              onClick={() => setShowDemo(true)}
              className="mt-6 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              Start Learning! 🚀
            </button>
          )}
        </div>

        {/* Demo Section */}
        {showDemo && (
          <div className="flex flex-col items-center">
            {/* Controls */}
            <div className="mb-6 flex gap-4 flex-wrap justify-center">
              <button
                onClick={() => setCurrentNumber(Math.max(1, currentNumber - 1))}
                disabled={currentNumber <= 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                ← Previous
              </button>

              <div className="px-4 py-2 bg-blue-100 rounded-lg font-semibold">
                Number {currentNumber} of 10
              </div>

              <button
                onClick={() =>
                  setCurrentNumber(Math.min(10, currentNumber + 1))
                }
                disabled={currentNumber >= 10}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                Next →
              </button>

              {/* Auto-progress toggle */}
              <button
                onClick={() => setAutoProgress(!autoProgress)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  autoProgress
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                {autoProgress ? "⏸️ Pause Auto" : "▶️ Resume Auto"}
              </button>
            </div>

            {/* Number Card */}
            <SimpleNumberCard
              key={currentNumber} // Force re-render for new number
              number={currentNumber}
              showObjects={currentNumber <= 5} // Show objects for 1-5 only
              objectType="apple"
              onComplete={handleComplete}
            />

            {/* Learning Flow Explanation */}
            <div className="mt-8 max-w-2xl">
              <h3 className="text-2xl font-semibold text-center mb-4">
                See → Hear → Say → Trace → Master
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">👀</div>
                  <div className="font-semibold">See</div>
                  <div className="text-sm text-gray-600">Visual learning</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">🔊</div>
                  <div className="font-semibold">Hear</div>
                  <div className="text-sm text-gray-600">AI voice teacher</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">🗣️</div>
                  <div className="font-semibold">Say</div>
                  <div className="text-sm text-gray-600">Practice speaking</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">✍️</div>
                  <div className="font-semibold">Trace</div>
                  <div className="text-sm text-gray-600">Motor skills</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-semibold">Master</div>
                  <div className="text-sm text-gray-600">Understanding</div>
                </div>
              </div>
            </div>

            {/* Reset Demo */}
            <div className="mt-8">
              <button
                onClick={() => {
                  setCurrentNumber(1);
                }}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                🔄 Restart Demo
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        {!showDemo && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Grade-Appropriate</h3>
              <p className="text-gray-600">
                Perfect for K-3 learners with adaptive pacing
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">🔊</div>
              <h3 className="font-semibold mb-2">AI Voice Teacher</h3>
              <p className="text-gray-600">
                Natural speech with encouraging feedback
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold mb-2">Multi-Sensory</h3>
              <p className="text-gray-600">
                See, hear, say, and trace for deep learning
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
