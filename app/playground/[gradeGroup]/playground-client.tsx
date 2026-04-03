"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MediaWindow } from "@/components/atutori/media-window"
import {
  Calculator,
  BookOpen,
  FlaskConical,
  Palette,
  Music,
  Globe,
  Code,
  History,
  Languages,
  Atom,
  PenTool,
  Lightbulb,
  Star,
  ChevronRight,
  Sparkles,
  Rocket,
  GraduationCap,
  Brain,
  Puzzle,
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

interface Subject {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  progress: number
  lessonsCompleted: number
  totalLessons: number
}

// Grade group configurations
const gradeGroupConfig: Record<string, {
  title: string
  subtitle: string
  icon: React.ReactNode
  theme: {
    primary: string
    secondary: string
    accent: string
  }
  subjects: Subject[]
}> = {
  "primary-early": {
    title: "Early Explorers",
    subtitle: "Grades 1-3",
    icon: <Star className="h-8 w-8" />,
    theme: {
      primary: "from-amber-400 to-orange-500",
      secondary: "bg-amber-100",
      accent: "text-amber-600",
    },
    subjects: [
      { id: "math", name: "Numbers Fun", icon: <Calculator className="h-6 w-6" />, color: "text-blue-600", bgColor: "bg-blue-100", progress: 45, lessonsCompleted: 9, totalLessons: 20 },
      { id: "reading", name: "Story Time", icon: <BookOpen className="h-6 w-6" />, color: "text-green-600", bgColor: "bg-green-100", progress: 60, lessonsCompleted: 12, totalLessons: 20 },
      { id: "art", name: "Art & Colors", icon: <Palette className="h-6 w-6" />, color: "text-pink-600", bgColor: "bg-pink-100", progress: 30, lessonsCompleted: 6, totalLessons: 20 },
      { id: "music", name: "Music Play", icon: <Music className="h-6 w-6" />, color: "text-purple-600", bgColor: "bg-purple-100", progress: 25, lessonsCompleted: 5, totalLessons: 20 },
      { id: "science", name: "Discovery Zone", icon: <FlaskConical className="h-6 w-6" />, color: "text-teal-600", bgColor: "bg-teal-100", progress: 35, lessonsCompleted: 7, totalLessons: 20 },
      { id: "world", name: "Our World", icon: <Globe className="h-6 w-6" />, color: "text-indigo-600", bgColor: "bg-indigo-100", progress: 20, lessonsCompleted: 4, totalLessons: 20 },
      { id: "puzzles", name: "Think & Solve", icon: <Puzzle className="h-6 w-6" />, color: "text-orange-600", bgColor: "bg-orange-100", progress: 15, lessonsCompleted: 3, totalLessons: 20 },
    ],
  },
  "primary-mid": {
    title: "Growing Minds",
    subtitle: "Grades 4-6",
    icon: <Sparkles className="h-8 w-8" />,
    theme: {
      primary: "from-teal-400 to-cyan-500",
      secondary: "bg-teal-100",
      accent: "text-teal-600",
    },
    subjects: [
      { id: "math", name: "Mathematics", icon: <Calculator className="h-6 w-6" />, color: "text-blue-600", bgColor: "bg-blue-100", progress: 55, lessonsCompleted: 11, totalLessons: 20 },
      { id: "english", name: "English", icon: <BookOpen className="h-6 w-6" />, color: "text-green-600", bgColor: "bg-green-100", progress: 40, lessonsCompleted: 8, totalLessons: 20 },
      { id: "science", name: "Science", icon: <FlaskConical className="h-6 w-6" />, color: "text-teal-600", bgColor: "bg-teal-100", progress: 50, lessonsCompleted: 10, totalLessons: 20 },
      { id: "history", name: "History", icon: <History className="h-6 w-6" />, color: "text-amber-600", bgColor: "bg-amber-100", progress: 35, lessonsCompleted: 7, totalLessons: 20 },
      { id: "geography", name: "Geography", icon: <Globe className="h-6 w-6" />, color: "text-indigo-600", bgColor: "bg-indigo-100", progress: 30, lessonsCompleted: 6, totalLessons: 20 },
      { id: "art", name: "Creative Arts", icon: <Palette className="h-6 w-6" />, color: "text-pink-600", bgColor: "bg-pink-100", progress: 45, lessonsCompleted: 9, totalLessons: 20 },
      { id: "puzzles", name: "Logic Puzzles", icon: <Puzzle className="h-6 w-6" />, color: "text-orange-600", bgColor: "bg-orange-100", progress: 25, lessonsCompleted: 5, totalLessons: 20 },
    ],
  },
  "primary-upper": {
    title: "Rising Stars",
    subtitle: "Grades 7-8",
    icon: <Rocket className="h-8 w-8" />,
    theme: {
      primary: "from-indigo-400 to-violet-500",
      secondary: "bg-indigo-100",
      accent: "text-indigo-600",
    },
    subjects: [
      { id: "math", name: "Pre-Algebra", icon: <Calculator className="h-6 w-6" />, color: "text-blue-600", bgColor: "bg-blue-100", progress: 65, lessonsCompleted: 13, totalLessons: 20 },
      { id: "english", name: "Language Arts", icon: <PenTool className="h-6 w-6" />, color: "text-green-600", bgColor: "bg-green-100", progress: 50, lessonsCompleted: 10, totalLessons: 20 },
      { id: "science", name: "Life Science", icon: <FlaskConical className="h-6 w-6" />, color: "text-teal-600", bgColor: "bg-teal-100", progress: 45, lessonsCompleted: 9, totalLessons: 20 },
      { id: "coding", name: "Intro to Coding", icon: <Code className="h-6 w-6" />, color: "text-orange-600", bgColor: "bg-orange-100", progress: 40, lessonsCompleted: 8, totalLessons: 20 },
      { id: "history", name: "World History", icon: <History className="h-6 w-6" />, color: "text-amber-600", bgColor: "bg-amber-100", progress: 35, lessonsCompleted: 7, totalLessons: 20 },
      { id: "languages", name: "Foreign Language", icon: <Languages className="h-6 w-6" />, color: "text-rose-600", bgColor: "bg-rose-100", progress: 25, lessonsCompleted: 5, totalLessons: 20 },
      { id: "puzzles", name: "Logic & Algorithms", icon: <Puzzle className="h-6 w-6" />, color: "text-orange-600", bgColor: "bg-orange-100", progress: 30, lessonsCompleted: 6, totalLessons: 20 },
    ],
  },
  "high-junior": {
    title: "Junior Scholars",
    subtitle: "Grades 9-10",
    icon: <BookOpen className="h-8 w-8" />,
    theme: {
      primary: "from-rose-400 to-pink-500",
      secondary: "bg-rose-100",
      accent: "text-rose-600",
    },
    subjects: [
      { id: "algebra", name: "Algebra", icon: <Calculator className="h-6 w-6" />, color: "text-blue-600", bgColor: "bg-blue-100", progress: 70, lessonsCompleted: 14, totalLessons: 20 },
      { id: "geometry", name: "Geometry", icon: <Lightbulb className="h-6 w-6" />, color: "text-cyan-600", bgColor: "bg-cyan-100", progress: 55, lessonsCompleted: 11, totalLessons: 20 },
      { id: "biology", name: "Biology", icon: <FlaskConical className="h-6 w-6" />, color: "text-green-600", bgColor: "bg-green-100", progress: 60, lessonsCompleted: 12, totalLessons: 20 },
      { id: "chemistry", name: "Chemistry", icon: <Atom className="h-6 w-6" />, color: "text-purple-600", bgColor: "bg-purple-100", progress: 45, lessonsCompleted: 9, totalLessons: 20 },
      { id: "literature", name: "Literature", icon: <BookOpen className="h-6 w-6" />, color: "text-amber-600", bgColor: "bg-amber-100", progress: 50, lessonsCompleted: 10, totalLessons: 20 },
      { id: "programming", name: "Programming", icon: <Code className="h-6 w-6" />, color: "text-orange-600", bgColor: "bg-orange-100", progress: 35, lessonsCompleted: 7, totalLessons: 20 },
      { id: "puzzles", name: "Computational Thinking", icon: <Puzzle className="h-6 w-6" />, color: "text-cyan-600", bgColor: "bg-cyan-100", progress: 40, lessonsCompleted: 8, totalLessons: 20 },
    ],
  },
  "high-senior": {
    title: "Senior Achievers",
    subtitle: "Grades 11-12",
    icon: <GraduationCap className="h-8 w-8" />,
    theme: {
      primary: "from-purple-400 to-indigo-500",
      secondary: "bg-purple-100",
      accent: "text-purple-600",
    },
    subjects: [
      { id: "calculus", name: "Calculus", icon: <Calculator className="h-6 w-6" />, color: "text-blue-600", bgColor: "bg-blue-100", progress: 75, lessonsCompleted: 15, totalLessons: 20 },
      { id: "physics", name: "Physics", icon: <Atom className="h-6 w-6" />, color: "text-indigo-600", bgColor: "bg-indigo-100", progress: 60, lessonsCompleted: 12, totalLessons: 20 },
      { id: "chemistry", name: "Advanced Chemistry", icon: <FlaskConical className="h-6 w-6" />, color: "text-teal-600", bgColor: "bg-teal-100", progress: 55, lessonsCompleted: 11, totalLessons: 20 },
      { id: "cs", name: "Computer Science", icon: <Code className="h-6 w-6" />, color: "text-orange-600", bgColor: "bg-orange-100", progress: 65, lessonsCompleted: 13, totalLessons: 20 },
      { id: "economics", name: "Economics", icon: <Lightbulb className="h-6 w-6" />, color: "text-green-600", bgColor: "bg-green-100", progress: 40, lessonsCompleted: 8, totalLessons: 20 },
      { id: "writing", name: "Academic Writing", icon: <PenTool className="h-6 w-6" />, color: "text-rose-600", bgColor: "bg-rose-100", progress: 50, lessonsCompleted: 10, totalLessons: 20 },
      { id: "puzzles", name: "Advanced Logic", icon: <Puzzle className="h-6 w-6" />, color: "text-cyan-600", bgColor: "bg-cyan-100", progress: 45, lessonsCompleted: 9, totalLessons: 20 },
    ],
  },
}

export function PlaygroundClient({
  user,
  gradeGroup,
}: {
  user: User
  gradeGroup: string
}) {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  
  const config = gradeGroupConfig[gradeGroup] || gradeGroupConfig["primary-early"]
  const xpForNextLevel = user.level * 100
  const xpProgress = (user.xp % 100) / 100 * 100

  const handleStartLesson = (subjectId: string) => {
    router.push(`/playground/${gradeGroup}/lesson/${subjectId}`)
  }

  const handleSelectVideo = (media: { id: string }) => {
    router.push(`/playground/${gradeGroup}/video/${media.id}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-card to-accent/20 border-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Welcome back, {user.name}!
              </h2>
              <p className="text-muted-foreground">
                Ready to continue your learning adventure?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Level Progress</p>
                <p className="text-lg font-bold text-foreground">
                  {user.xp % 100} / {xpForNextLevel} XP
                </p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${xpProgress * 2.83} 283`}
                    strokeLinecap="round"
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{user.level}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Two Column Layout: Subjects + Media */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subjects Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-foreground mb-4">Your Subjects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.subjects.map((subject) => (
            <Card
              key={subject.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleStartLesson(subject.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${subject.bgColor} ${subject.color}`}>
                    {subject.icon}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
                
                <h4 className="text-lg font-bold text-foreground mb-1">
                  {subject.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {subject.lessonsCompleted} of {subject.totalLessons} lessons completed
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </div>
              </div>
            </Card>
          ))}
            </div>
          </div>

          {/* Media Window Column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-foreground mb-4">My Videos</h3>
            <MediaWindow onSelectVideo={handleSelectVideo} />
          </div>
        </div>

        {/* Daily Goal */}
        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Daily Goal</h4>
                <p className="text-sm text-muted-foreground">Complete 3 lessons today</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">1 / 3</p>
                <p className="text-sm text-muted-foreground">lessons</p>
              </div>
              <Progress value={33} className="w-32 h-3" />
            </div>
          </div>
        </Card>
      </div>
  
  )
}
