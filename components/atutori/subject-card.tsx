"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"

interface SubjectCardProps {
  title: string
  icon: LucideIcon
  progress: number
  lessonsCompleted: number
  totalLessons: number
  color: string
  onClick?: () => void
  className?: string
}

export function SubjectCard({
  title,
  icon: Icon,
  progress,
  lessonsCompleted,
  totalLessons,
  color,
  onClick,
  className
}: SubjectCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] rounded-2xl border-2 border-transparent hover:border-primary/20",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div 
            className="flex h-14 w-14 items-center justify-center rounded-xl shadow-sm"
            style={{ backgroundColor: color }}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {lessonsCompleted} of {totalLessons} lessons
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
