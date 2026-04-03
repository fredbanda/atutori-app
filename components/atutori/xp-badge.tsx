"use client"

import { cn } from "@/lib/utils"
import { Star, Zap } from "lucide-react"

interface XPBadgeProps {
  xp: number
  level: number
  className?: string
}

export function XPBadge({ xp, level, className }: XPBadgeProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 shadow-sm">
        <Zap className="h-4 w-4 fill-accent-foreground text-accent-foreground" />
        <span className="text-sm font-bold text-accent-foreground">{xp} XP</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 shadow-sm">
        <Star className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
        <span className="text-sm font-bold text-primary-foreground">Level {level}</span>
      </div>
    </div>
  )
}
