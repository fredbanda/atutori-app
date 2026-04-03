"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import {
  Star,
  Flame,
  Trophy,
  LogOut,
  Sparkles,
  Rocket,
  GraduationCap,
  BookOpen,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  grade: number
  gradeGroup: string
  level: number
  xp: number
  streakDays: number
}

// Grade group configurations
const gradeGroupConfig: Record<string, {
  title: string
  subtitle: string
  icon: React.ReactNode
  theme: {
    primary: string
  }
}> = {
  "primary-early": {
    title: "Early Explorers",
    subtitle: "Grades 1-3",
    icon: <Star className="h-7 w-7" />,
    theme: { primary: "from-amber-400 to-orange-500" },
  },
  "primary-mid": {
    title: "Growing Minds",
    subtitle: "Grades 4-6",
    icon: <Sparkles className="h-7 w-7" />,
    theme: { primary: "from-teal-400 to-cyan-500" },
  },
  "primary-upper": {
    title: "Rising Stars",
    subtitle: "Grades 7-8",
    icon: <Rocket className="h-7 w-7" />,
    theme: { primary: "from-indigo-400 to-violet-500" },
  },
  "high-junior": {
    title: "Junior Scholars",
    subtitle: "Grades 9-10",
    icon: <BookOpen className="h-7 w-7" />,
    theme: { primary: "from-rose-400 to-pink-500" },
  },
  "high-senior": {
    title: "Senior Achievers",
    subtitle: "Grades 11-12",
    icon: <GraduationCap className="h-7 w-7" />,
    theme: { primary: "from-purple-400 to-indigo-500" },
  },
}

export function PlaygroundHeader({ user, gradeGroup }: { user: User; gradeGroup: string }) {
  const router = useRouter()
  const config = gradeGroupConfig[gradeGroup] || gradeGroupConfig["primary-early"]

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
  }

  return (
    <header className={`bg-gradient-to-r ${config.theme.primary} text-white`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              {config.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold">{config.title}</h1>
              <p className="text-sm text-white/80">{config.subtitle} - Grade {user.grade}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <Flame className="h-4 w-4 text-orange-300" />
              <span className="font-bold text-sm">{user.streakDays}</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <Star className="h-4 w-4 text-yellow-300" />
              <span className="font-bold text-sm">{user.xp} XP</span>
            </div>

            {/* Level */}
            <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <Trophy className="h-4 w-4 text-amber-300" />
              <span className="font-bold text-sm">Lv. {user.level}</span>
            </div>

            {/* User Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
