"use client";

import { useState } from "react";
import NumberCard from "./NumberCard";

interface NumberSequenceProps {
  numbers: number[];
  userGrade: 1 | 2 | 3;
  showObjects?: boolean;
  objectType?: "apple" | "star" | "circle" | "square";
  onSequenceComplete?: () => void;
}

export default function NumberSequence({
  numbers,
  userGrade,
  showObjects = false,
  objectType = "apple",
  onSequenceComplete,
}: NumberSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedNumbers, setCompletedNumbers] = useState<number[]>([]);
  const [isSequenceComplete, setIsSequenceComplete] = useState(false);

  const handleCardComplete = () => {
    const currentNumber = numbers[currentIndex];
    setCompletedNumbers((prev) => [...prev, currentNumber]);

    if (currentIndex < numbers.length - 1) {
      // Move to next number
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 1500);
    } else {
      // Sequence complete
      setTimeout(() => {
        setIsSequenceComplete(true);
        onSequenceComplete?.();
      }, 1500);
    }
  };

  const resetSequence = () => {
    setCurrentIndex(0);
    setCompletedNumbers([]);
    setIsSequenceComplete(false);
  };

  if (isSequenceComplete) {
    return (
      <div className="flex flex-col items-center p-8">
        {/* Success celebration */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-[400px] h-[400px] rounded-3xl flex flex-col items-center justify-center shadow-xl text-white">
          <span className="text-8xl mb-4">🎉</span>
          <h2 className="text-3xl font-bold mb-2">Amazing Work!</h2>
          <p className="text-xl text-center mb-6">
            You learned all the numbers!
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {completedNumbers.map((num) => (
              <span
                key={num}
                className="bg-white text-green-600 px-4 py-2 rounded-full font-bold"
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={resetSequence}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            🔄 Practice Again
          </button>
          <button
            onClick={onSequenceComplete}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            ➡️ Next Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Learning Numbers {numbers[0]} to {numbers[numbers.length - 1]}
        </h2>

        {/* Progress bar */}
        <div className="w-80 bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / numbers.length) * 100}%` }}
          />
        </div>

        <p className="text-gray-600">
          Number {currentIndex + 1} of {numbers.length}:{" "}
          <strong>{numbers[currentIndex]}</strong>
        </p>

        {/* Number sequence preview */}
        <div className="flex gap-2 mt-4 justify-center flex-wrap">
          {numbers.map((num, index) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                index < currentIndex
                  ? "bg-green-500 text-white scale-90"
                  : index === currentIndex
                  ? "bg-blue-500 text-white scale-110 ring-2 ring-blue-300"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Current number card */}
      <NumberCard
        number={numbers[currentIndex]}
        userGrade={userGrade}
        showObjects={showObjects}
        objectType={objectType}
        onComplete={handleCardComplete}
        autoStart={true}
      />

      {/* Encouragement message */}
      <div className="mt-8 text-center max-w-md">
        {currentIndex === 0 && (
          <p className="text-lg text-gray-600">
            🌟 Let's start learning! Take your time and have fun!
          </p>
        )}
        {currentIndex > 0 && currentIndex < numbers.length - 1 && (
          <p className="text-lg text-gray-600">
            🚀 You're doing great! Keep going!
          </p>
        )}
        {currentIndex === numbers.length - 1 && (
          <p className="text-lg text-gray-600">
            🎯 This is the last number! You're almost done!
          </p>
        )}
      </div>
    </div>
  );
}
