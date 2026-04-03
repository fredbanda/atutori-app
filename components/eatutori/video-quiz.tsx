"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Sparkles,
  Trophy,
  RefreshCw,
  Loader2,
  Star
} from "lucide-react"
import confetti from "canvas-confetti"

interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

interface VideoQuizProps {
  mediaId: string
  videoTitle: string
  videoDescription: string | null
  onComplete: (score: number) => void
  onBack: () => void
}

export function VideoQuiz({
  mediaId,
  videoTitle,
  videoDescription,
  onComplete,
  onBack
}: VideoQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await fetch("/api/quiz-from-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaId,
            videoTitle,
            videoDescription
          })
        })
        if (!response.ok) throw new Error("Failed to generate quiz")
        const data = await response.json()
        setQuestions(data.questions)
      } catch (err) {
        setError("Could not generate quiz questions")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [mediaId, videoTitle, videoDescription])

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100

  const handleAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleConfirm = () => {
    if (selectedAnswer === null) return
    
    setShowResult(true)
    if (selectedAnswer === currentQuestion.correctIndex) {
      setCorrectAnswers(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Quiz complete
      const score = Math.round(((correctAnswers + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0)) / questions.length) * 100)
      setIsFinished(true)
      
      if (score >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
      
      onComplete(score)
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setCorrectAnswers(0)
    setIsFinished(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Generating your quiz...</p>
        <p className="text-muted-foreground">AI is creating questions based on the video</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  if (isFinished) {
    const finalScore = Math.round((correctAnswers / questions.length) * 100)
    const stars = finalScore >= 90 ? 3 : finalScore >= 70 ? 2 : finalScore >= 50 ? 1 : 0

    return (
      <Card className="rounded-3xl border-2 border-primary/20 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-8 text-center text-white">
          <Trophy className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-white/80">Great job watching and learning!</p>
        </div>
        <CardContent className="p-8 text-center">
          <div className="text-6xl font-bold text-primary mb-4">{finalScore}%</div>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`h-10 w-10 ${
                  star <= stars
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>

          <p className="text-lg mb-6">
            You got <span className="font-bold text-primary">{correctAnswers}</span> out of{" "}
            <span className="font-bold">{questions.length}</span> questions correct!
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onBack}
              size="lg"
              className="rounded-2xl h-14"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Back to Videos
            </Button>
            {finalScore < 100 && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="lg"
                className="rounded-2xl h-14"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="font-bold text-lg">Video Quiz</h2>
          <p className="text-sm text-muted-foreground">{videoTitle}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Question */}
      <Card className="rounded-3xl border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.correctIndex
            
            let buttonStyle = "bg-background hover:bg-primary/5 border-2 border-border"
            if (showResult) {
              if (isCorrect) {
                buttonStyle = "bg-green-50 border-2 border-green-500 text-green-700"
              } else if (isSelected && !isCorrect) {
                buttonStyle = "bg-red-50 border-2 border-red-500 text-red-700"
              }
            } else if (isSelected) {
              buttonStyle = "bg-primary/10 border-2 border-primary"
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-3 ${buttonStyle}`}
              >
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Action button */}
      <Button
        onClick={showResult ? handleNext : handleConfirm}
        disabled={selectedAnswer === null}
        size="lg"
        className="w-full rounded-2xl h-14 text-lg font-bold"
      >
        {showResult ? (
          currentIndex < questions.length - 1 ? "Next Question" : "See Results"
        ) : (
          "Check Answer"
        )}
      </Button>
    </div>
  )
}
