"use client"

import { Trophy, Star, RotateCcw, ChevronRight, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "./progress-ring"

interface ResultsScreenProps {
  score: number
  total: number
  xpEarned: number
  subject: string
  lessonTitle: string
  onRetry: () => void
  onNextLesson: () => void
  onBackToDashboard: () => void
}

export function ResultsScreen({
  score,
  total,
  xpEarned,
  subject,
  lessonTitle,
  onRetry,
  onNextLesson,
  onBackToDashboard
}: ResultsScreenProps) {
  const percentage = Math.round((score / total) * 100)
  const isPerfect = score === total
  const isGood = percentage >= 60
  
  const getMessage = () => {
    if (isPerfect) return "Perfect score! You're a superstar!"
    if (percentage >= 80) return "Amazing work! Almost perfect!"
    if (percentage >= 60) return "Good job! Keep practicing!"
    return "Nice try! Let's learn some more!"
  }

  const getStars = () => {
    if (percentage >= 100) return 3
    if (percentage >= 80) return 2
    if (percentage >= 60) return 1
    return 0
  }

  const stars = getStars()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-3xl border-0 shadow-xl">
        <CardContent className="flex flex-col items-center p-8 text-center">
          {/* Celebration Icon */}
          <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-lg ${
            isGood ? "bg-success" : "bg-accent"
          }`}>
            {isPerfect ? (
              <Trophy className={`h-10 w-10 ${isGood ? "text-success-foreground" : "text-accent-foreground"}`} />
            ) : (
              <Sparkles className={`h-10 w-10 ${isGood ? "text-success-foreground" : "text-accent-foreground"}`} />
            )}
          </div>

          {/* Score Display */}
          <div className="mb-4">
            <ProgressRing progress={percentage} size={160} strokeWidth={14}>
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">{score}/{total}</span>
              </div>
            </ProgressRing>
          </div>

          {/* Stars */}
          <div className="mb-4 flex gap-2">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`h-8 w-8 transition-all ${
                  starNum <= stars 
                    ? "fill-accent text-accent" 
                    : "text-muted"
                }`}
              />
            ))}
          </div>

          {/* Message */}
          <h2 className="mb-2 text-2xl font-bold text-foreground">{getMessage()}</h2>
          <p className="mb-6 text-muted-foreground">
            {lessonTitle} - {subject}
          </p>

          {/* XP Earned */}
          <Card className="mb-6 w-full rounded-2xl border-2 border-accent bg-accent/20">
            <CardContent className="flex items-center justify-center gap-2 p-4">
              <Zap className="h-6 w-6 fill-accent-foreground text-accent-foreground" />
              <span className="text-xl font-bold text-accent-foreground">+{xpEarned} XP</span>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex w-full flex-col gap-3">
            {!isGood && (
              <Button 
                variant="outline"
                size="lg"
                onClick={onRetry}
                className="w-full rounded-xl"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Try Again
              </Button>
            )}
            <Button 
              size="lg"
              onClick={onNextLesson}
              className="w-full rounded-xl shadow-md"
            >
              Next Lesson
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
            <Button 
              variant="ghost"
              size="lg"
              onClick={onBackToDashboard}
              className="w-full rounded-xl text-muted-foreground"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
