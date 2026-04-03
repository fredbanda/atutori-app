"use client"

import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface QuizOptionProps {
  label: string
  option: string
  isSelected: boolean
  isCorrect?: boolean
  showResult?: boolean
  onClick: () => void
  disabled?: boolean
}

export function QuizOption({
  label,
  option,
  isSelected,
  isCorrect,
  showResult,
  onClick,
  disabled
}: QuizOptionProps) {
  const getStyles = () => {
    if (showResult) {
      if (isCorrect) {
        return "border-success bg-success/10 text-success"
      }
      if (isSelected && !isCorrect) {
        return "border-destructive bg-destructive/10 text-destructive"
      }
      return "border-muted bg-muted/50 text-muted-foreground opacity-60"
    }
    if (isSelected) {
      return "border-primary bg-primary/10 text-primary shadow-md"
    }
    return "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200",
        "disabled:cursor-not-allowed",
        !disabled && !showResult && "active:scale-[0.98]",
        getStyles()
      )}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold",
        showResult && isCorrect && "bg-success text-success-foreground",
        showResult && isSelected && !isCorrect && "bg-destructive text-destructive-foreground",
        !showResult && isSelected && "bg-primary text-primary-foreground",
        !showResult && !isSelected && "bg-muted text-muted-foreground"
      )}>
        {showResult && isCorrect && <Check className="h-5 w-5" />}
        {showResult && isSelected && !isCorrect && <X className="h-5 w-5" />}
        {!showResult && label}
      </div>
      <span className="flex-1 text-base font-medium">{option}</span>
    </button>
  )
}
