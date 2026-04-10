"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import NumberCard from "./NumberCard";
import LetterCard from "./LetterCard";

interface CardLessonRendererProps {
  grade: 1 | 2 | 3;
  subjectId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export default function CardLessonRenderer({
  grade,
  subjectId,
  onComplete,
  onBack,
}: CardLessonRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<number[]>([]);

  // Define card sequences based on subject and grade
  const getCardSequence = () => {
    switch (subjectId) {
      case "math":
      case "counting":
      case "number-writing":
      case "addition-basic":
        return {
          type: "NumberCard" as const,
          items:
            grade === 1
              ? [1, 2, 3, 4, 5]
              : grade === 2
              ? [1, 2, 3, 4, 5, 6, 7, 8]
              : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        };

      case "english":
      case "phonics":
      case "letters":
      case "reading":
        return {
          type: "LetterCard" as const,
          items:
            grade === 1
              ? ["A", "B", "C", "D", "E"]
              : grade === 2
              ? ["A", "B", "C", "D", "E", "F", "G", "H"]
              : ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        };

      default:
        return null;
    }
  };

  const cardSequence = getCardSequence();

  // Fallback for non-card subjects
  if (!cardSequence) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Traditional Lesson Mode</h2>
          <p className="text-gray-600">
            This subject uses the standard lesson format. Card-based learning is
            available for Math and English subjects.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          <Button onClick={onComplete}>
            Continue to Standard Lesson
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }

  const { type, items } = cardSequence;
  const currentItem = items[currentIndex];
  const isLastCard = currentIndex === items.length - 1;

  const handleCardComplete = () => {
    setCompletedCards((prev) => [...prev, currentIndex]);

    if (isLastCard) {
      // All cards completed
      onComplete();
    } else {
      // Move to next card
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 1000); // Brief pause before next card
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {type === "NumberCard"
                ? "🧮 Number Learning"
                : "🔤 Letter Learning"}
            </h2>
            <p className="text-gray-600">
              {type === "NumberCard"
                ? "Interactive number cards with voice guidance"
                : "Interactive letter cards with phonics"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              {currentIndex + 1} of {items.length}
            </p>
            <p className="text-sm text-gray-600">
              {completedCards.length} completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Card Display */}
      <div className="flex justify-center">
        {type === "NumberCard" && (
          <NumberCard
            key={`number-${currentItem}-${currentIndex}`}
            number={currentItem as number}
            userGrade={grade}
            showObjects={true}
            objectType="apple"
            onComplete={handleCardComplete}
            autoStart={true}
          />
        )}

        {type === "LetterCard" && (
          <LetterCard
            key={`letter-${currentItem}-${currentIndex}`}
            letter={currentItem as string}
            showPhonics={true}
            showWords={true}
            gradeDifficulty={grade}
            onComplete={handleCardComplete}
          />
        )}
      </div>

      {/* Navigation Controls */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0 && !onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentIndex === 0 ? "Back" : "Previous"}
          </Button>

          <div className="flex gap-2">
            {items.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  completedCards.includes(index)
                    ? "bg-green-500"
                    : index === currentIndex
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex >= items.length - 1}
            variant={isLastCard ? "default" : "outline"}
          >
            {isLastCard ? "Complete Lesson" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
