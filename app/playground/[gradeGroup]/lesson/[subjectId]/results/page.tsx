"use client"

import { use, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Trophy, ArrowRight, RotateCcw, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"

export default function ResultsPage({
  params,
}: {
  params: Promise<{ gradeGroup: string; subjectId: string }>
}) {
  const { gradeGroup, subjectId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [saved, setSaved] = useState(false)

  const correct = parseInt(searchParams.get("correct") || "0")
  const total = parseInt(searchParams.get("total") || "1")
  const xpEarned = parseInt(searchParams.get("xp") || "0")

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 100
  const stars = percentage >= 80 ? 3 : percentage >= 60 ? 2 : percentage >= 40 ? 1 : 0

  useEffect(() => {
    // Trigger confetti on mount if good score
    if (percentage >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }

    // Save progress to database
    const saveProgress = async () => {
      try {
        await fetch("/api/user/update-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            xpEarned,
            subjectId,
            correct,
            total,
          }),
        })
        setSaved(true)
      } catch (error) {
        console.error("Failed to save progress:", error)
      }
    }

    saveProgress()
  }, [percentage, xpEarned, subjectId, correct, total])

  const getMessage = () => {
    if (percentage >= 80) return "Amazing work!"
    if (percentage >= 60) return "Great job!"
    if (percentage >= 40) return "Good effort!"
    return "Keep practicing!"
  }

  const getEmoji = () => {
    if (percentage >= 80) return "🎉"
    if (percentage >= 60) return "🌟"
    if (percentage >= 40) return "👍"
    return "💪"
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {/* Celebration Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            {percentage >= 60 ? (
              <Trophy className="h-10 w-10 text-primary" />
            ) : (
              <Sparkles className="h-10 w-10 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getMessage()} {getEmoji()}
          </h1>
          <p className="text-muted-foreground">Lesson Complete</p>
        </div>

        {/* Score */}
        <div className="bg-accent/50 rounded-2xl p-6 mb-6">
          <div className="text-5xl font-bold text-foreground mb-2">
            {percentage}%
          </div>
          <p className="text-muted-foreground">
            {correct} out of {total} correct
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`h-10 w-10 transition-all duration-500 ${
                star <= stars
                  ? "text-amber-400 fill-amber-400 scale-110"
                  : "text-muted"
              }`}
              style={{
                transitionDelay: `${star * 200}ms`,
              }}
            />
          ))}
        </div>

        {/* XP Earned */}
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-2 mb-8">
          <Star className="h-5 w-5 fill-current" />
          <span className="font-bold">+{xpEarned} XP earned!</span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(`/playground/${gradeGroup}`)}
          >
            Continue Learning
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/playground/${gradeGroup}/lesson/${subjectId}`)}
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  )
}
