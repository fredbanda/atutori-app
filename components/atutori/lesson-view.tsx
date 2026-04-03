"use client"

import { ArrowLeft, ChevronRight, Lightbulb, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface LessonViewProps {
  title: string
  subject: string
  lessonNumber: number
  totalLessons: number
  content: string
  example: {
    title: string
    content: string
  }
  onBack: () => void
  onNext: () => void
}

export function LessonView({
  title,
  subject,
  lessonNumber,
  totalLessons,
  content,
  example,
  onBack,
  onNext
}: LessonViewProps) {
  const progress = (lessonNumber / totalLessons) * 100

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
            <p className="text-sm font-medium text-primary">{subject}</p>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs font-medium text-muted-foreground">
                {lessonNumber}/{totalLessons}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        {/* Lesson Title */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Lesson {lessonNumber}</p>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
        </div>

        {/* Lesson Content */}
        <Card className="mb-6 rounded-2xl border-0 bg-card shadow-sm">
          <CardContent className="p-6">
            <p className="text-base leading-relaxed text-foreground">{content}</p>
          </CardContent>
        </Card>

        {/* Example Box */}
        <Card className="mb-8 rounded-2xl border-2 border-accent bg-accent/30 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <Lightbulb className="h-4 w-4 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-bold text-accent-foreground">{example.title}</h3>
            </div>
            <p className="text-base leading-relaxed text-foreground">{example.content}</p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end">
          <Button 
            onClick={onNext}
            size="lg"
            className="rounded-xl px-8 shadow-md hover:shadow-lg"
          >
            Next
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  )
}
