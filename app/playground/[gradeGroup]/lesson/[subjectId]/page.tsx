"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Star,
  Lightbulb,
  Volume2,
} from "lucide-react"

// Sample lesson content for different grade groups and subjects
const lessonContent: Record<string, Record<string, {
  title: string
  lessons: {
    type: "content" | "quiz"
    title?: string
    content?: string
    example?: string
    question?: string
    options?: string[]
    correctAnswer?: number
    explanation?: string
  }[]
}>> = {
  "primary-early": {
    math: {
      title: "Numbers Fun",
      lessons: [
        {
          type: "content",
          title: "Counting to 10",
          content: "Let's learn to count! Numbers help us know how many things we have.",
          example: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
        },
        {
          type: "quiz",
          question: "How many apples are there? 🍎🍎🍎",
          options: ["2", "3", "4", "5"],
          correctAnswer: 1,
          explanation: "Count each apple: 1, 2, 3! There are 3 apples.",
        },
        {
          type: "content",
          title: "Adding Numbers",
          content: "When we add, we put things together to find out how many in total!",
          example: "2 + 1 = 3 (Two apples plus one apple equals three apples!)",
        },
        {
          type: "quiz",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
          explanation: "2 + 2 = 4! You can count: 1, 2... then 3, 4!",
        },
      ],
    },
    reading: {
      title: "Story Time",
      lessons: [
        {
          type: "content",
          title: "The Alphabet",
          content: "Letters make words! Let's start with the first letters: A, B, C, D, E",
          example: "A is for Apple 🍎, B is for Ball ⚽, C is for Cat 🐱",
        },
        {
          type: "quiz",
          question: "What letter does 'Dog' start with?",
          options: ["B", "C", "D", "E"],
          correctAnswer: 2,
          explanation: "Dog starts with the letter D! D-O-G spells Dog 🐕",
        },
      ],
    },
    puzzles: {
      title: "Think & Solve",
      lessons: [
        {
          type: "content",
          title: "What is a Puzzle?",
          content: "A puzzle is like a game where we use our brain to find the answer! Thinking step-by-step helps us solve tricky problems.",
          example: "Hint: When you are stuck, try thinking about what you know first!",
        },
        {
          type: "content",
          title: "The Missing Sock",
          content: "You have 3 red socks and 2 blue socks in a dark drawer. How many socks do you need to pull out to be SURE you have a matching pair?",
          example: "Step 1: If you pull 1 sock, it could be red or blue. Step 2: If you pull 2 socks, they might not match (1 red, 1 blue). Step 3: Pull a 3rd sock - now you MUST have a match!",
        },
        {
          type: "quiz",
          question: "If you have red and blue socks mixed up, how many do you need to grab to be SURE you have 2 of the same color?",
          options: ["1 sock", "2 socks", "3 socks", "4 socks"],
          correctAnswer: 2,
          explanation: "You need 3 socks! The first 2 might be different colors, but the 3rd one MUST match one of them!",
        },
        {
          type: "content",
          title: "Pattern Detective",
          content: "Programmers love patterns! Look at this: Circle, Square, Circle, Square, Circle, ??? What comes next?",
          example: "Hint: Say the pattern out loud - Circle, Square, Circle, Square... It keeps repeating!",
        },
        {
          type: "quiz",
          question: "What comes next? Star, Heart, Star, Heart, Star, ???",
          options: ["Star", "Heart", "Circle", "Square"],
          correctAnswer: 1,
          explanation: "Great job! The pattern is Star, Heart, Star, Heart... so Heart comes next!",
        },
      ],
    },
  },
  "primary-mid": {
    math: {
      title: "Mathematics",
      lessons: [
        {
          type: "content",
          title: "Multiplication Basics",
          content: "Multiplication is a quick way to add the same number multiple times.",
          example: "3 × 4 means adding 3 four times: 3 + 3 + 3 + 3 = 12",
        },
        {
          type: "quiz",
          question: "What is 5 × 3?",
          options: ["12", "15", "18", "20"],
          correctAnswer: 1,
          explanation: "5 × 3 = 15. Think of it as 5 + 5 + 5 = 15!",
        },
        {
          type: "content",
          title: "Division Introduction",
          content: "Division splits a number into equal groups. It&apos;s the opposite of multiplication.",
          example: "12 ÷ 3 = 4 (12 items split into 3 groups gives 4 in each group)",
        },
        {
          type: "quiz",
          question: "What is 20 ÷ 4?",
          options: ["4", "5", "6", "8"],
          correctAnswer: 1,
          explanation: "20 ÷ 4 = 5. Twenty split into 4 equal groups gives 5 in each!",
        },
      ],
    },
    science: {
      title: "Science",
      lessons: [
        {
          type: "content",
          title: "The Water Cycle",
          content: "Water moves in a cycle: evaporation, condensation, and precipitation.",
          example: "Sun heats water → Water rises as vapor → Clouds form → Rain falls!",
        },
        {
          type: "quiz",
          question: "What happens when water is heated by the sun?",
          options: ["It freezes", "It evaporates", "It turns into ice", "It disappears"],
          correctAnswer: 1,
          explanation: "Water evaporates when heated, turning into water vapor that rises into the air!",
        },
      ],
    },
    puzzles: {
      title: "Logic Puzzles",
      lessons: [
        {
          type: "content",
          title: "Thinking Like a Programmer",
          content: "Programmers solve problems by breaking them into smaller steps. This is called an ALGORITHM - a set of instructions to solve a problem!",
          example: "Algorithm for making a sandwich: 1) Get bread 2) Add filling 3) Put bread on top 4) Cut in half",
        },
        {
          type: "content",
          title: "The River Crossing Puzzle",
          content: "A farmer needs to cross a river with a fox, a chicken, and a bag of grain. The boat only fits the farmer and ONE item. If left alone: the fox eats the chicken, or the chicken eats the grain!",
          example: "Step 1: Take the chicken across (fox won&apos;t eat grain). Step 2: Go back alone. Step 3: Take the fox across. Step 4: Bring the chicken BACK. Step 5: Take the grain across. Step 6: Go back and get the chicken!",
        },
        {
          type: "quiz",
          question: "In the river crossing puzzle, what should the farmer take FIRST?",
          options: ["The fox", "The grain", "The chicken", "Nothing"],
          correctAnswer: 2,
          explanation: "Take the chicken first! If you leave the chicken with the fox, the fox eats it. If you leave the chicken with the grain, it eats the grain. But the fox won&apos;t eat the grain!",
        },
        {
          type: "content",
          title: "The Heavy Ball Puzzle",
          content: "You have 9 balls that look the same, but ONE is slightly heavier. You have a balance scale. What&apos;s the FEWEST number of times you need to use the scale to find the heavy ball?",
          example: "Hint: Don&apos;t compare one ball at a time! Think about dividing the balls into groups...",
        },
        {
          type: "quiz",
          question: "With 9 identical-looking balls (1 heavier) and a balance scale, what&apos;s the minimum number of weighings needed?",
          options: ["4 weighings", "3 weighings", "2 weighings", "1 weighing"],
          correctAnswer: 2,
          explanation: "Only 2! Divide into 3 groups of 3. Weigh group 1 vs group 2. If they balance, the heavy ball is in group 3. If not, it&apos;s in the heavier group. Then weigh 2 balls from that group!",
        },
      ],
    },
  },
  "primary-upper": {
    math: {
      title: "Pre-Algebra",
      lessons: [
        {
          type: "content",
          title: "Variables and Expressions",
          content: "A variable is a letter that represents an unknown number. We use them in expressions like x + 5.",
          example: "If x = 3, then x + 5 = 3 + 5 = 8",
        },
        {
          type: "quiz",
          question: "If y = 7, what is y + 4?",
          options: ["9", "10", "11", "12"],
          correctAnswer: 2,
          explanation: "If y = 7, then y + 4 = 7 + 4 = 11",
        },
      ],
    },
    coding: {
      title: "Intro to Coding",
      lessons: [
        {
          type: "content",
          title: "What is Code?",
          content: "Code is instructions we write for computers. Computers follow these instructions exactly!",
          example: "print(\"Hello, World!\") tells the computer to show the words Hello, World!",
        },
        {
          type: "quiz",
          question: "What does code do?",
          options: ["Draws pictures", "Gives computers instructions", "Makes sounds", "Plays games"],
          correctAnswer: 1,
          explanation: "Code gives computers instructions to follow. Computers do exactly what the code says!",
        },
      ],
    },
    puzzles: {
      title: "Logic & Algorithms",
      lessons: [
        {
          type: "content",
          title: "Introduction to Algorithms",
          content: "An algorithm is a step-by-step procedure to solve a problem. Programmers use algorithms to make computers solve complex tasks efficiently.",
          example: "Searching for a word in a dictionary: Start in the middle, then go left or right based on alphabetical order - this is called Binary Search!",
        },
        {
          type: "content",
          title: "The Towers of Hanoi",
          content: "You have 3 pegs and 3 disks of different sizes stacked on peg A (largest at bottom). Move all disks to peg C. Rules: 1) Move one disk at a time. 2) Never put a larger disk on a smaller one.",
          example: "For 3 disks, the minimum moves needed is 7. The pattern: for n disks, you need 2^n - 1 moves!",
        },
        {
          type: "quiz",
          question: "In Towers of Hanoi with 2 disks, what is the minimum number of moves?",
          options: ["1 move", "2 moves", "3 moves", "4 moves"],
          correctAnswer: 2,
          explanation: "3 moves! Move small disk to B, large disk to C, small disk to C. Formula: 2^2 - 1 = 3",
        },
        {
          type: "content",
          title: "The Locker Problem",
          content: "100 lockers in a row, all closed. Person 1 opens every locker. Person 2 closes every 2nd locker. Person 3 changes every 3rd locker (open to closed, or closed to open). This continues for 100 people. Which lockers stay open?",
          example: "A locker is toggled once for each of its factors. Locker 12 is toggled by persons 1, 2, 3, 4, 6, 12 (6 times = even = closed). But locker 9 is toggled by 1, 3, 9 (3 times = odd = open!)",
        },
        {
          type: "quiz",
          question: "After 100 people, which lockers remain open?",
          options: ["All even numbers", "All odd numbers", "Perfect squares (1, 4, 9, 16...)", "Prime numbers"],
          correctAnswer: 2,
          explanation: "Perfect squares! They have an ODD number of factors (9 has factors 1, 3, 9). Only perfect squares have odd factors because one factor is repeated (3 x 3 = 9).",
        },
      ],
    },
  },
  "high-junior": {
    algebra: {
      title: "Algebra",
      lessons: [
        {
          type: "content",
          title: "Solving Linear Equations",
          content: "To solve for x, we perform the same operation on both sides of the equation to isolate x.",
          example: "2x + 5 = 13 → 2x = 8 → x = 4",
        },
        {
          type: "quiz",
          question: "Solve for x: 3x - 6 = 15",
          options: ["x = 5", "x = 7", "x = 9", "x = 3"],
          correctAnswer: 1,
          explanation: "3x - 6 = 15 → 3x = 21 → x = 7",
        },
      ],
    },
    biology: {
      title: "Biology",
      lessons: [
        {
          type: "content",
          title: "Cell Structure",
          content: "Cells are the basic units of life. They contain organelles like the nucleus, mitochondria, and ribosomes.",
          example: "The nucleus contains DNA and controls cell activities. Mitochondria produce energy (ATP).",
        },
        {
          type: "quiz",
          question: "Which organelle is known as the 'powerhouse' of the cell?",
          options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"],
          correctAnswer: 2,
          explanation: "Mitochondria are called the powerhouse because they produce ATP, the cell&apos;s energy currency!",
        },
      ],
    },
    puzzles: {
      title: "Computational Thinking",
      lessons: [
        {
          type: "content",
          title: "Decomposition",
          content: "Decomposition means breaking a complex problem into smaller, manageable parts. This is one of the four pillars of computational thinking.",
          example: "Planning a party: Break it into 1) Guest list 2) Venue 3) Food 4) Entertainment 5) Invitations - each part is easier to handle!",
        },
        {
          type: "content",
          title: "The Monty Hall Problem",
          content: "You&apos;re on a game show with 3 doors. Behind one is a car, behind the others are goats. You pick door 1. The host (who knows what&apos;s behind each door) opens door 3, revealing a goat. Should you SWITCH to door 2 or STAY with door 1?",
          example: "Intuition says 50/50, but math says SWITCH! Initially you had 1/3 chance. When the host reveals a goat, the 2/3 probability transfers to the other closed door!",
        },
        {
          type: "quiz",
          question: "In the Monty Hall problem, what should you do to maximize your chance of winning the car?",
          options: ["Stay with your original choice", "Switch to the other door", "It doesn&apos;t matter - both are 50%", "Ask for a hint"],
          correctAnswer: 1,
          explanation: "Always SWITCH! Switching wins 2/3 of the time. Your initial pick was 1/3 correct. The host revealing a goat didn&apos;t change that - it concentrated the remaining 2/3 on the other door.",
        },
        {
          type: "content",
          title: "The Prisoners and Hats",
          content: "4 prisoners are buried in sand: 3 can see the back of the person ahead, 1 is behind a wall. They wear hats (2 black, 2 white) and can&apos;t see their own. If anyone correctly says their hat color, all go free. They can&apos;t communicate.",
          example: "Person 4 sees persons 2 and 3. If 2 and 3 have the same color, person 4 knows theirs is different and speaks. If 4 stays silent, person 3 knows their hat differs from person 2&apos;s!",
        },
        {
          type: "quiz",
          question: "In the prisoners and hats puzzle, if person 4 (in back) stays silent, what does person 3 learn?",
          options: ["Their hat is black", "Their hat is white", "Their hat is different from person 2&apos;s", "Nothing useful"],
          correctAnswer: 2,
          explanation: "If 4 stays silent, they can&apos;t determine their color - meaning persons 2 and 3 have DIFFERENT colors. Person 3 can see person 2&apos;s color, so they know their own is the opposite!",
        },
      ],
    },
  },
  "high-senior": {
    calculus: {
      title: "Calculus",
      lessons: [
        {
          type: "content",
          title: "Introduction to Derivatives",
          content: "A derivative measures the rate of change of a function. It tells us how fast something is changing at any point.",
          example: "If f(x) = x², then f&apos;(x) = 2x. At x=3, the rate of change is 6.",
        },
        {
          type: "quiz",
          question: "What is the derivative of f(x) = 3x²?",
          options: ["3x", "6x", "x²", "3x³"],
          correctAnswer: 1,
          explanation: "Using the power rule: d/dx(3x²) = 3 · 2x = 6x",
        },
      ],
    },
    physics: {
      title: "Physics",
      lessons: [
        {
          type: "content",
          title: "Newton's Second Law",
          content: "Force equals mass times acceleration (F = ma). This fundamental law describes how objects move.",
          example: "A 10 kg object accelerating at 2 m/s² experiences a force of 20 N.",
        },
        {
          type: "quiz",
          question: "What force is needed to accelerate a 5 kg mass at 4 m/s²?",
          options: ["9 N", "20 N", "1.25 N", "15 N"],
          correctAnswer: 1,
          explanation: "F = ma = 5 kg × 4 m/s² = 20 N",
        },
      ],
    },
    puzzles: {
      title: "Advanced Logic",
      lessons: [
        {
          type: "content",
          title: "Graph Theory Basics",
          content: "Graph theory studies connections. The famous Konigsberg Bridge Problem asked: can you cross all 7 bridges exactly once? Euler proved it&apos;s impossible by analyzing the graph structure.",
          example: "A graph has vertices (nodes) and edges (connections). An Eulerian path (crossing each edge once) exists only if 0 or 2 vertices have odd degree (odd number of connections).",
        },
        {
          type: "quiz",
          question: "For an Eulerian path to exist (visiting each edge exactly once), how many vertices can have an odd number of edges?",
          options: ["Any number", "Exactly 0", "Exactly 0 or 2", "Only even numbers"],
          correctAnswer: 2,
          explanation: "Exactly 0 or 2! With 0 odd vertices, you can start anywhere and return. With 2 odd vertices, you start at one and end at the other.",
        },
        {
          type: "content",
          title: "The Blue Eyes Puzzle",
          content: "On an island, 100 people have blue eyes and 100 have brown eyes. They can see others&apos; eye colors but not their own. If anyone discovers their own eye color, they must leave at midnight. One day, a visitor says 'I see someone with blue eyes.'",
          example: "This is common knowledge in action. With 1 blue-eyed person, they&apos;d leave night 1. With 2, each waits to see if the other leaves night 1; when they don&apos;t, both realize and leave night 2. With n blue-eyed people, all leave on night n!",
        },
        {
          type: "quiz",
          question: "If there are 100 blue-eyed people, on which night do they all leave?",
          options: ["Night 1", "Night 50", "Night 99", "Night 100"],
          correctAnswer: 3,
          explanation: "Night 100! Each person reasons: 'If there were 99 blue-eyed people, they&apos;d leave on night 99. They didn&apos;t, so there must be 100, which means I have blue eyes too!'",
        },
        {
          type: "content",
          title: "NP-Complete Problems",
          content: "Some problems are easy to verify but hard to solve. The Traveling Salesman Problem (TSP) asks: what&apos;s the shortest route visiting all cities exactly once? With n cities, there are (n-1)!/2 possible routes!",
          example: "With just 10 cities: 181,440 routes. With 20 cities: over 60 quadrillion routes! This exponential growth makes brute force impractical for large inputs.",
        },
        {
          type: "quiz",
          question: "Why can&apos;t we simply check all possible routes in the Traveling Salesman Problem?",
          options: ["Routes can&apos;t be compared", "The number of routes grows exponentially", "Some routes are invalid", "Computers can&apos;t calculate distances"],
          correctAnswer: 1,
          explanation: "The number of routes grows factorially (even faster than exponentially)! With n cities, there are (n-1)!/2 routes. Even fast computers can&apos;t check them all for large n.",
        },
      ],
    },
  },
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ gradeGroup: string; subjectId: string }>
}) {
  const { gradeGroup, subjectId } = use(params)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)

  // Get lesson content or fallback to a default
  const subjectLessons = lessonContent[gradeGroup]?.[subjectId] || {
    title: "Lesson",
    lessons: [
      {
        type: "content" as const,
        title: "Welcome!",
        content: "This lesson is coming soon. Check back later for more content!",
        example: "Stay curious and keep learning!",
      },
    ],
  }

  const lessons = subjectLessons.lessons
  const currentLesson = lessons[currentStep]
  const progress = ((currentStep + 1) / lessons.length) * 100
  const isQuiz = currentLesson.type === "quiz"
  const isLastStep = currentStep === lessons.length - 1

  const handleAnswerSelect = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return
    setShowResult(true)
    
    if (selectedAnswer === currentLesson.correctAnswer) {
      setCorrectAnswers((prev) => prev + 1)
      setXpEarned((prev) => prev + 10)
    }
  }

  const handleNext = () => {
    if (isLastStep) {
      // Complete lesson - navigate to results
      router.push(
        `/playground/${gradeGroup}/lesson/${subjectId}/results?correct=${correctAnswers}&total=${lessons.filter((l) => l.type === "quiz").length}&xp=${xpEarned}`
      )
    } else {
      setCurrentStep((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleBack = () => {
    router.push(`/playground/${gradeGroup}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
            <h1 className="font-bold text-foreground">{subjectLessons.title}</h1>
            <div className="flex items-center gap-2 text-amber-500">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold">+{xpEarned} XP</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {currentStep + 1} of {lessons.length}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {currentLesson.type === "content" ? (
          /* Content View */
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {currentLesson.title}
            </h2>
            
            <p className="text-lg text-foreground leading-relaxed mb-6">
              {currentLesson.content}
            </p>

            {currentLesson.example && (
              <div className="bg-primary/10 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Lightbulb className="h-5 w-5" />
                  <span className="font-semibold">Example</span>
                </div>
                <p className="text-foreground font-medium">{currentLesson.example}</p>
              </div>
            )}

            <Button size="lg" className="w-full" onClick={handleNext}>
              {isLastStep ? "Complete Lesson" : "Continue"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Card>
        ) : (
          /* Quiz View */
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {currentLesson.question}
            </h2>

            <div className="space-y-4 mb-8">
              {currentLesson.options?.map((option, index) => {
                let buttonStyle = "border-2 border-border bg-card hover:border-primary hover:bg-accent"
                
                if (showResult) {
                  if (index === currentLesson.correctAnswer) {
                    buttonStyle = "border-2 border-green-500 bg-green-50 text-green-700"
                  } else if (index === selectedAnswer && selectedAnswer !== currentLesson.correctAnswer) {
                    buttonStyle = "border-2 border-red-500 bg-red-50 text-red-700"
                  }
                } else if (selectedAnswer === index) {
                  buttonStyle = "border-2 border-primary bg-primary/10"
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl text-left text-lg font-medium transition-all ${buttonStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && index === currentLesson.correctAnswer && (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      )}
                      {showResult && index === selectedAnswer && selectedAnswer !== currentLesson.correctAnswer && (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {showResult && currentLesson.explanation && (
              <div className={`rounded-xl p-4 mb-6 ${
                selectedAnswer === currentLesson.correctAnswer
                  ? "bg-green-50 border border-green-200"
                  : "bg-amber-50 border border-amber-200"
              }`}>
                <p className="text-foreground">{currentLesson.explanation}</p>
              </div>
            )}

            {!showResult ? (
              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
              >
                Check Answer
              </Button>
            ) : (
              <Button size="lg" className="w-full" onClick={handleNext}>
                {isLastStep ? "See Results" : "Continue"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  )
}
