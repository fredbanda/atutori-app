"use client"

import { useState } from "react"
import { ArrowLeft, ChevronRight, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QuizOption } from "./quiz-option"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizViewProps {
  title: string
  subject: string
  questions: Question[]
  onBack: () => void
  onComplete: (score: number, total: number) => void
}

export function QuizView({
  title,
  subject,
  questions,
  onBack,
  onComplete
}: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const optionLabels = ["A", "B", "C", "D"]

  const handleSelectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
    setShowResult(true)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = selectedAnswer === currentQuestion.correctAnswer ? score + 1 : score
      onComplete(showResult ? score : finalScore, questions.length)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">{subject} Quiz</p>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs font-medium text-muted-foreground">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        {/* Question Card */}
        <Card className="mb-6 rounded-2xl border-0 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestionIndex + 1}
              </span>
            </div>
            <h2 className="text-xl font-bold leading-relaxed text-foreground md:text-2xl">
              {currentQuestion.question}
            </h2>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="mb-8 flex flex-col gap-3">
          {currentQuestion.options.map((option, index) => (
            <QuizOption
              key={index}
              label={optionLabels[index]}
              option={option}
              isSelected={selectedAnswer === index}
              isCorrect={index === currentQuestion.correctAnswer}
              showResult={showResult}
              onClick={() => handleSelectAnswer(index)}
              disabled={showResult}
            />
          ))}
        </div>

        {/* Feedback Message */}
        {showResult && (
          <Card className={`mb-6 rounded-2xl border-2 ${
            selectedAnswer === currentQuestion.correctAnswer 
              ? "border-success bg-success/10" 
              : "border-destructive bg-destructive/10"
          }`}>
            <CardContent className="p-4">
              <p className={`text-center font-bold ${
                selectedAnswer === currentQuestion.correctAnswer 
                  ? "text-success" 
                  : "text-destructive"
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer 
                  ? "Great job! That's correct!" 
                  : `Not quite! The correct answer is ${optionLabels[currentQuestion.correctAnswer]}.`
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-end">
          {!showResult ? (
            <Button 
              onClick={handleCheckAnswer}
              size="lg"
              disabled={selectedAnswer === null}
              className="rounded-xl px-8 shadow-md hover:shadow-lg"
            >
              Check Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              size="lg"
              className="rounded-xl px-8 shadow-md hover:shadow-lg"
            >
              {isLastQuestion ? "See Results" : "Next Question"}
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
