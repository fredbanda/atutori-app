"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
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
  Puzzle,
  Home,
} from "lucide-react"

interface SubjectNavProps {
  gradeGroup: string
}

// Subject configurations per grade group
const subjectsByGrade: Record<string, { id: string; name: string; icon: React.ReactNode; color: string; bgColor: string }[]> = {
  "primary-early": [
    { id: "math", name: "Numbers", icon: <Calculator className="h-4 w-4" />, color: "text-blue-600", bgColor: "bg-blue-100" },
    { id: "english", name: "English", icon: <BookOpen className="h-4 w-4" />, color: "text-green-600", bgColor: "bg-green-100" },
    { id: "art", name: "Art", icon: <Palette className="h-4 w-4" />, color: "text-pink-600", bgColor: "bg-pink-100" },
    { id: "music", name: "Music", icon: <Music className="h-4 w-4" />, color: "text-purple-600", bgColor: "bg-purple-100" },
    { id: "science", name: "Discovery", icon: <FlaskConical className="h-4 w-4" />, color: "text-teal-600", bgColor: "bg-teal-100" },
    { id: "world", name: "World", icon: <Globe className="h-4 w-4" />, color: "text-indigo-600", bgColor: "bg-indigo-100" },
    { id: "puzzles", name: "Puzzles", icon: <Puzzle className="h-4 w-4" />, color: "text-orange-600", bgColor: "bg-orange-100" },
  ],
  "primary-mid": [
    { id: "math", name: "Math", icon: <Calculator className="h-4 w-4" />, color: "text-blue-600", bgColor: "bg-blue-100" },
    { id: "english", name: "English", icon: <BookOpen className="h-4 w-4" />, color: "text-green-600", bgColor: "bg-green-100" },
    { id: "science", name: "Science", icon: <FlaskConical className="h-4 w-4" />, color: "text-teal-600", bgColor: "bg-teal-100" },
    { id: "history", name: "History", icon: <History className="h-4 w-4" />, color: "text-amber-600", bgColor: "bg-amber-100" },
    { id: "geography", name: "Geography", icon: <Globe className="h-4 w-4" />, color: "text-indigo-600", bgColor: "bg-indigo-100" },
    { id: "art", name: "Art", icon: <Palette className="h-4 w-4" />, color: "text-pink-600", bgColor: "bg-pink-100" },
    { id: "puzzles", name: "Logic", icon: <Puzzle className="h-4 w-4" />, color: "text-orange-600", bgColor: "bg-orange-100" },
  ],
  "primary-upper": [
    { id: "math", name: "Pre-Algebra", icon: <Calculator className="h-4 w-4" />, color: "text-blue-600", bgColor: "bg-blue-100" },
    { id: "english", name: "Language", icon: <PenTool className="h-4 w-4" />, color: "text-green-600", bgColor: "bg-green-100" },
    { id: "science", name: "Life Science", icon: <FlaskConical className="h-4 w-4" />, color: "text-teal-600", bgColor: "bg-teal-100" },
    { id: "coding", name: "Coding", icon: <Code className="h-4 w-4" />, color: "text-orange-600", bgColor: "bg-orange-100" },
    { id: "history", name: "World History", icon: <History className="h-4 w-4" />, color: "text-amber-600", bgColor: "bg-amber-100" },
    { id: "languages", name: "Languages", icon: <Languages className="h-4 w-4" />, color: "text-rose-600", bgColor: "bg-rose-100" },
    { id: "puzzles", name: "Algorithms", icon: <Puzzle className="h-4 w-4" />, color: "text-cyan-600", bgColor: "bg-cyan-100" },
  ],
  "high-junior": [
    { id: "algebra", name: "Algebra", icon: <Calculator className="h-4 w-4" />, color: "text-blue-600", bgColor: "bg-blue-100" },
    { id: "geometry", name: "Geometry", icon: <Lightbulb className="h-4 w-4" />, color: "text-cyan-600", bgColor: "bg-cyan-100" },
    { id: "biology", name: "Biology", icon: <FlaskConical className="h-4 w-4" />, color: "text-green-600", bgColor: "bg-green-100" },
    { id: "chemistry", name: "Chemistry", icon: <Atom className="h-4 w-4" />, color: "text-purple-600", bgColor: "bg-purple-100" },
    { id: "literature", name: "Literature", icon: <BookOpen className="h-4 w-4" />, color: "text-amber-600", bgColor: "bg-amber-100" },
    { id: "programming", name: "Programming", icon: <Code className="h-4 w-4" />, color: "text-orange-600", bgColor: "bg-orange-100" },
    { id: "puzzles", name: "Comp. Thinking", icon: <Puzzle className="h-4 w-4" />, color: "text-cyan-600", bgColor: "bg-cyan-100" },
  ],
  "high-senior": [
    { id: "calculus", name: "Calculus", icon: <Calculator className="h-4 w-4" />, color: "text-blue-600", bgColor: "bg-blue-100" },
    { id: "physics", name: "Physics", icon: <Atom className="h-4 w-4" />, color: "text-indigo-600", bgColor: "bg-indigo-100" },
    { id: "chemistry", name: "Chemistry", icon: <FlaskConical className="h-4 w-4" />, color: "text-teal-600", bgColor: "bg-teal-100" },
    { id: "cs", name: "Comp. Science", icon: <Code className="h-4 w-4" />, color: "text-orange-600", bgColor: "bg-orange-100" },
    { id: "economics", name: "Economics", icon: <Lightbulb className="h-4 w-4" />, color: "text-green-600", bgColor: "bg-green-100" },
    { id: "writing", name: "Writing", icon: <PenTool className="h-4 w-4" />, color: "text-rose-600", bgColor: "bg-rose-100" },
    { id: "puzzles", name: "Advanced Logic", icon: <Puzzle className="h-4 w-4" />, color: "text-cyan-600", bgColor: "bg-cyan-100" },
  ],
}

export function SubjectNav({ gradeGroup }: SubjectNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const subjects = subjectsByGrade[gradeGroup] || subjectsByGrade["primary-early"]
  
  // Determine active subject from pathname
  const activeSubject = pathname.includes("/lesson/") 
    ? pathname.split("/lesson/")[1]?.split("/")[0] 
    : null

  const isHome = pathname === `/playground/${gradeGroup}`

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {/* Home Button */}
          <button
            onClick={() => router.push(`/playground/${gradeGroup}`)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              isHome
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Subject Buttons */}
          {subjects.map((subject) => {
            const isActive = activeSubject === subject.id
            return (
              <button
                key={subject.id}
                onClick={() => router.push(`/playground/${gradeGroup}/lesson/${subject.id}`)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? `${subject.bgColor} ${subject.color} shadow-md`
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {subject.icon}
                <span className="hidden md:inline">{subject.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
