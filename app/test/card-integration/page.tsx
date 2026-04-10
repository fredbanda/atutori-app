"use client";

import { useState } from "react";
import CardLessonRenderer from "@/components/eatutori/CardLessonRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function TestCardIntegrationPage() {
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const tests = [
    {
      id: "grade1-math",
      name: "Grade 1 Math (NumberCards)",
      description: "Test NumberCard sequence for Grade 1 math",
      grade: 1 as const,
      subject: "math",
    },
    {
      id: "grade1-english",
      name: "Grade 1 English (LetterCards)",
      description: "Test LetterCard sequence for Grade 1 english",
      grade: 1 as const,
      subject: "english",
    },
    {
      id: "grade2-math",
      name: "Grade 2 Math (NumberCards)",
      description: "Test NumberCard sequence for Grade 2 math",
      grade: 2 as const,
      subject: "math",
    },
    {
      id: "grade3-english",
      name: "Grade 3 English (LetterCards)",
      description: "Test LetterCard sequence for Grade 3 english",
      grade: 3 as const,
      subject: "english",
    },
  ];

  if (currentTest) {
    const test = tests.find((t) => t.id === currentTest);
    if (!test) {
      setCurrentTest(null);
      return null;
    }

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentTest(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
            <h1 className="text-3xl font-bold mb-2">{test.name}</h1>
            <p className="text-gray-600">{test.description}</p>
          </div>

          <CardLessonRenderer
            grade={test.grade}
            subjectId={test.subject}
            onComplete={() => {
              alert(`${test.name} completed successfully! 🎉`);
              setCurrentTest(null);
            }}
            onBack={() => setCurrentTest(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            🧪 Card Integration Test Suite
          </h1>
          <p className="text-xl text-gray-600">
            Test the CardLessonRenderer integration with different grades and
            subjects
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tests.map((test) => (
            <Card
              key={test.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{test.name}</h3>
                  <p className="text-gray-600 mb-4">{test.description}</p>
                  <div className="flex gap-2 text-sm text-gray-500 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Grade {test.grade}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {test.subject === "math" ? "NumberCards" : "LetterCards"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentTest(test.id)}
                  className="w-full"
                >
                  Start Test
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-bold mb-2">🎯 Test Features</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              <strong>NumberCards</strong>: See → Hear → Say → Trace → Master
              flow with numbers
            </li>
            <li>
              <strong>LetterCards</strong>: See → Hear → Phonics → Say → Trace →
              Word → Master flow with letters
            </li>
            <li>
              <strong>Grade Adaptation</strong>: Different sequence lengths and
              timing for each grade
            </li>
            <li>
              <strong>Progress Tracking</strong>: Visual progress indicators and
              completion states
            </li>
            <li>
              <strong>Navigation</strong>: Previous/Next controls and completion
              handling
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
