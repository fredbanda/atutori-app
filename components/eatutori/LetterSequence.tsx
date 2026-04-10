"use client";

import { useState, useEffect } from "react";
import LetterCard from "./LetterCard";

interface LetterSequenceProps {
  startLetter?: string;
  endLetter?: string;
  gradeDifficulty?: 1 | 2 | 3;
  showPhonics?: boolean;
  showWords?: boolean;
  autoProgress?: boolean;
  onSequenceComplete?: () => void;
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function LetterSequence({
  startLetter = "A",
  endLetter = "Z",
  gradeDifficulty = 1,
  showPhonics = true,
  showWords = true,
  autoProgress = true,
  onSequenceComplete,
}: LetterSequenceProps) {
  const startIndex = alphabet.indexOf(startLetter.toUpperCase());
  const endIndex = alphabet.indexOf(endLetter.toUpperCase());
  const letterSequence = alphabet.slice(startIndex, endIndex + 1);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedLetters, setCompletedLetters] = useState<string[]>([]);
  const [isSequenceComplete, setIsSequenceComplete] = useState(false);

  const currentLetter = letterSequence[currentIndex];

  const handleLetterComplete = () => {
    const newCompletedLetters = [...completedLetters, currentLetter];
    setCompletedLetters(newCompletedLetters);

    if (autoProgress && currentIndex < letterSequence.length - 1) {
      // Move to next letter after celebration
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 2000);
    } else if (currentIndex >= letterSequence.length - 1) {
      // Sequence complete
      setIsSequenceComplete(true);
      setTimeout(() => {
        onSequenceComplete?.();
      }, 3000);
    }
  };

  const goToNextLetter = () => {
    if (currentIndex < letterSequence.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPreviousLetter = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetSequence = () => {
    setCurrentIndex(0);
    setCompletedLetters([]);
    setIsSequenceComplete(false);
  };

  const getProgressPercentage = () => {
    return Math.round((completedLetters.length / letterSequence.length) * 100);
  };

  if (isSequenceComplete) {
    return (
      <div className="flex flex-col items-center p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-emerald-600 mb-4">
            🎉 Alphabet Mastered! 🎉
          </h2>
          <p className="text-xl text-gray-600">
            You learned {letterSequence.length} letters from {startLetter} to{" "}
            {endLetter}!
          </p>

          {/* Celebration Animation */}
          <div className="mt-6 text-6xl animate-bounce">🌟 🏆 🌟</div>

          {/* Completed Letters Display */}
          <div className="mt-8 p-6 bg-emerald-50 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-emerald-800">
              Letters You Mastered:
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {completedLetters.map((letter) => (
                <div
                  key={letter}
                  className="w-12 h-12 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold text-lg"
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={resetSequence}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🔄 Practice Again
            </button>
            <button
              onClick={onSequenceComplete}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              ✨ Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            🔤 Learning Letters {startLetter} - {endLetter}
          </h2>
          <div className="text-sm text-gray-600">Grade {gradeDifficulty}</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Progress: {currentIndex + 1} of {letterSequence.length}
          </span>
          <span>{getProgressPercentage()}% Complete</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-4 flex-wrap justify-center items-center">
        <button
          onClick={goToPreviousLetter}
          disabled={currentIndex <= 0}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
        >
          ← Previous
        </button>

        <div className="px-4 py-2 bg-blue-100 rounded-lg font-semibold">
          Letter {currentLetter} ({currentIndex + 1}/{letterSequence.length})
        </div>

        <button
          onClick={goToNextLetter}
          disabled={currentIndex >= letterSequence.length - 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
        >
          Next →
        </button>

        <button
          onClick={resetSequence}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          🔄 Reset
        </button>
      </div>

      {/* Letter Card */}
      <LetterCard
        key={currentLetter} // Force re-render for new letter
        letter={currentLetter}
        gradeDifficulty={gradeDifficulty}
        showPhonics={showPhonics}
        showWords={showWords}
        onComplete={handleLetterComplete}
      />

      {/* Sequence Overview */}
      <div className="mt-8 max-w-4xl">
        <h3 className="text-lg font-semibold text-center mb-4">
          Alphabet Progress
        </h3>
        <div className="grid grid-cols-6 md:grid-cols-13 gap-2">
          {letterSequence.map((letter, index) => (
            <div
              key={letter}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer ${
                completedLetters.includes(letter)
                  ? "bg-emerald-500 text-white transform scale-110"
                  : index === currentIndex
                  ? "bg-blue-500 text-white ring-2 ring-blue-300"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* Learning Features Info */}
      <div className="mt-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">🗣️</div>
            <div className="font-semibold">Phonics Learning</div>
            <div className="text-gray-600">
              {showPhonics ? "Enabled" : "Disabled"}
            </div>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold">Word Building</div>
            <div className="text-gray-600">
              {showWords ? "Enabled" : "Disabled"}
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold">Auto Progress</div>
            <div className="text-gray-600">
              {autoProgress ? "On" : "Manual"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
