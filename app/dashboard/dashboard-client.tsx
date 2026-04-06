"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Calculator,
  BookOpen,
  Microscope,
  Palette,
  Music,
  ChevronRight,
  Sparkles,
  LogOut,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { XPBadge } from "@/components/eatutori/xp-badge";
import { ProgressRing } from "@/components/eatutori/progress-ring";
import { SubjectCard } from "@/components/eatutori/subject-card";
import { LessonView } from "@/components/eatutori/lesson-view";
import { QuizView } from "@/components/eatutori/quiz-view";
import { ResultsScreen } from "@/components/eatutori/results-screen";

interface DashboardClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  profileComplete: boolean;
}

type View = "dashboard" | "lesson" | "quiz" | "results";

const subjects = [
  {
    id: "math",
    title: "Math",
    icon: Calculator,
    progress: 65,
    lessonsCompleted: 13,
    totalLessons: 20,
    color: "oklch(0.65 0.18 175)",
  },
  {
    id: "english",
    title: "English",
    icon: BookOpen,
    progress: 45,
    lessonsCompleted: 9,
    totalLessons: 20,
    color: "oklch(0.75 0.15 280)",
  },
  {
    id: "science",
    title: "Science",
    icon: Microscope,
    progress: 30,
    lessonsCompleted: 6,
    totalLessons: 20,
    color: "oklch(0.7 0.18 145)",
  },
  {
    id: "art",
    title: "Art",
    icon: Palette,
    progress: 80,
    lessonsCompleted: 16,
    totalLessons: 20,
    color: "oklch(0.85 0.15 50)",
  },
  {
    id: "music",
    title: "Music",
    icon: Music,
    progress: 55,
    lessonsCompleted: 11,
    totalLessons: 20,
    color: "oklch(0.75 0.18 330)",
  },
];

const lessonData = {
  math: {
    title: "Understanding Fractions",
    content:
      "A fraction is a way to represent a part of a whole. When we cut a pizza into 4 equal slices and eat 1 slice, we've eaten 1/4 (one-fourth) of the pizza. The top number (numerator) tells us how many parts we have, and the bottom number (denominator) tells us how many equal parts the whole is divided into.",
    example: {
      title: "Let's Practice!",
      content:
        "If you have 8 strawberries and give 3 to your friend, you can write this as 3/8. This means 3 parts out of 8 total parts. The fraction 3/8 shows that your friend got 3 strawberries from the 8 you had!",
    },
  },
  english: {
    title: "Reading Comprehension",
    content:
      "Reading comprehension means understanding what you read. When you read a story, try to picture it in your mind like a movie. Ask yourself: Who are the characters? Where does the story happen? What is the main problem? Good readers always think about what they're reading.",
    example: {
      title: "Try This!",
      content:
        "After reading a paragraph, close the book and tell yourself what happened in your own words. If you can explain it to a friend or family member, you've understood it well!",
    },
  },
  science: {
    title: "The Water Cycle",
    content:
      "Water is always moving around our planet in a big circle called the water cycle. The sun heats up water in oceans, lakes, and rivers, and it turns into water vapor (this is called evaporation). The vapor goes up into the sky and forms clouds (condensation). When clouds get heavy, water falls back down as rain or snow (precipitation).",
    example: {
      title: "Fun Fact!",
      content:
        "The water you drink today could be the same water that dinosaurs drank millions of years ago! Water keeps recycling through the water cycle over and over again.",
    },
  },
  art: {
    title: "Color Theory Basics",
    content:
      "Colors can be mixed to create new colors! Red, blue, and yellow are called primary colors because you can't make them by mixing other colors. When you mix two primary colors together, you get secondary colors: red + yellow = orange, blue + yellow = green, and red + blue = purple.",
    example: {
      title: "Let's Experiment!",
      content:
        "Try mixing red and blue paint together. What color do you get? Now try adding a tiny bit more red. See how the color changes? This is how artists create all the beautiful colors you see in paintings!",
    },
  },
  music: {
    title: "Understanding Rhythm",
    content:
      "Rhythm is the pattern of sounds and silences in music. It's what makes you want to tap your foot or clap your hands! Every song has a beat - the steady pulse you feel when listening to music. Some beats are stronger (like when you say 'ONE-two-three-four'), and some are softer.",
    example: {
      title: "Clap Along!",
      content:
        "Try clapping to your favorite song. Can you feel the beat? Try clapping on every strong beat. That's the rhythm! Even your heartbeat has a rhythm - put your hand on your chest and feel it.",
    },
  },
};

const quizData = {
  math: [
    {
      id: 1,
      question:
        "If a pizza is cut into 8 slices and you eat 3, what fraction did you eat?",
      options: ["1/8", "3/8", "8/3", "5/8"],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "In 5/6, what does 6 represent?",
      options: [
        "Parts you have",
        "Parts the whole is divided into",
        "The total",
        "The answer",
      ],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "Which fraction shows half?",
      options: ["1/4", "1/3", "1/2", "2/4"],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: "Share 12 cookies with 3 friends equally - what fraction each?",
      options: ["3/12", "4/12", "12/3", "1/3"],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: "What is the top number of a fraction called?",
      options: ["Denominator", "Numerator", "Whole number", "Factor"],
      correctAnswer: 1,
    },
  ],
  english: [
    {
      id: 1,
      question: "What does reading comprehension mean?",
      options: [
        "Reading fast",
        "Understanding what you read",
        "Reading aloud",
        "Memorizing",
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "What should you picture when reading?",
      options: [
        "Count words",
        "A movie in your mind",
        "Skip hard parts",
        "Read backwards",
      ],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "What is NOT a good question while reading?",
      options: [
        "Who are the characters?",
        "Where does it happen?",
        "What's for dinner?",
        "What's the problem?",
      ],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: "How can you tell you understood?",
      options: [
        "Read fast",
        "Explain in your words",
        "Book is closed",
        "Finished chapter",
      ],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: "Good readers always:",
      options: [
        "Skip pages",
        "Think about what they read",
        "Eyes closed",
        "Look at pictures only",
      ],
      correctAnswer: 1,
    },
  ],
  science: [
    {
      id: 1,
      question: "What is the water cycle?",
      options: ["A bicycle", "Water moving in a circle", "A bottle", "A pool"],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "What happens in evaporation?",
      options: [
        "Water freezes",
        "Water becomes vapor",
        "Clouds form",
        "It rains",
      ],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "What makes water evaporate?",
      options: ["Moon", "Sun", "Wind", "Fish"],
      correctAnswer: 1,
    },
    {
      id: 4,
      question: "Rain/snow falling is called:",
      options: ["Evaporation", "Condensation", "Precipitation", "Celebration"],
      correctAnswer: 2,
    },
    {
      id: 5,
      question: "What forms when vapor rises?",
      options: ["Rainbows", "Clouds", "Stars", "Mountains"],
      correctAnswer: 1,
    },
  ],
  art: [
    {
      id: 1,
      question: "What are primary colors?",
      options: [
        "Red, green, blue",
        "Red, yellow, blue",
        "Orange, green, purple",
        "Black, white, gray",
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "Red + yellow =",
      options: ["Green", "Purple", "Orange", "Brown"],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: "Why are primary colors special?",
      options: ["Brightest", "Can't mix to make them", "Oldest", "On rainbow"],
      correctAnswer: 1,
    },
    {
      id: 4,
      question: "Blue + yellow =",
      options: ["Orange", "Purple", "Green", "Red"],
      correctAnswer: 2,
    },
    {
      id: 5,
      question: "Orange, green, purple are:",
      options: ["Primary", "Secondary", "Tertiary", "Rainbow"],
      correctAnswer: 1,
    },
  ],
  music: [
    {
      id: 1,
      question: "What is rhythm?",
      options: ["Song words", "Sound/silence patterns", "Song name", "Volume"],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "What is a beat?",
      options: ["A drum", "Steady pulse you feel", "A dance", "Song's end"],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "What makes you tap your foot?",
      options: ["Singer", "Rhythm", "Title", "Instruments"],
      correctAnswer: 1,
    },
    {
      id: 4,
      question: "What else has rhythm?",
      options: ["Shadow", "Heartbeat", "Shoes", "Book"],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: "In music, beats are:",
      options: ["Strong and soft", "All same", "Only loud", "Only quiet"],
      correctAnswer: 0,
    },
  ],
};

const subjectNames: Record<string, string> = {
  math: "Math",
  english: "English",
  science: "Science",
  art: "Art",
  music: "Music",
};

export function DashboardClient({ user, profileComplete }: DashboardClientProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [currentSubject, setCurrentSubject] = useState<string>("math");
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);

  const totalProgress = Math.round(
    subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const handleStartLesson = (subjectId: string) => {
    setCurrentSubject(subjectId);
    setCurrentView("lesson");
  };

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore(score);
    setQuizTotal(total);
    setCurrentView("results");
  };

  const handleNextLesson = () => {
    const subjectKeys = Object.keys(lessonData);
    const nextIndex =
      (subjectKeys.indexOf(currentSubject) + 1) % subjectKeys.length;
    setCurrentSubject(subjectKeys[nextIndex]);
    setCurrentView("lesson");
  };

  const lesson = lessonData[currentSubject as keyof typeof lessonData];
  const questions = quizData[currentSubject as keyof typeof quizData];

  if (currentView === "lesson") {
    return (
      <LessonView
        title={lesson.title}
        subject={subjectNames[currentSubject]}
        lessonNumber={1}
        totalLessons={5}
        content={lesson.content}
        example={lesson.example}
        onBack={() => setCurrentView("dashboard")}
        onNext={() => setCurrentView("quiz")}
      />
    );
  }

  if (currentView === "quiz") {
    return (
      <QuizView
        title={lesson.title}
        subject={subjectNames[currentSubject]}
        questions={questions}
        onBack={() => setCurrentView("dashboard")}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (currentView === "results") {
    return (
      <ResultsScreen
        score={quizScore}
        total={quizTotal}
        xpEarned={quizScore * 20}
        subject={subjectNames[currentSubject]}
        lessonTitle={lesson.title}
        onRetry={() => setCurrentView("quiz")}
        onNextLesson={handleNextLesson}
        onBackToDashboard={() => setCurrentView("dashboard")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4 shadow-sm md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">eatutori</span>
          </div>
          <div className="flex items-center gap-4">
            <XPBadge xp={1250} level={5} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* Profile completion banner */}
        {!profileComplete && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Finish your profile
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Add your Cambridge details to unlock exam registration and credit transfers.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="shrink-0 rounded-xl bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => router.push("/profile/complete")}
            >
              Complete now
            </Button>
          </div>
        )}

        {/* Welcome Section */}
        <section className="mb-8">
          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row md:p-8">
              <div className="flex-1 text-center md:text-left">
                <h1 className="mb-2 text-2xl font-bold text-primary-foreground md:text-3xl">
                  Hi, {user.name.split(" ")[0]}!
                </h1>
                <p className="mb-4 text-primary-foreground/90">
                  {
                    "You're doing amazing! Keep up the great work and earn more XP!"
                  }
                </p>
                <Button
                  onClick={() => handleStartLesson("math")}
                  size="lg"
                  className="rounded-xl bg-white px-6 text-primary shadow-md hover:bg-white/90"
                >
                  Continue Learning
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </div>
              <ProgressRing
                progress={totalProgress}
                size={140}
                strokeWidth={12}
              >
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary-foreground">
                    {totalProgress}%
                  </span>
                  <p className="text-xs text-primary-foreground/80">Overall</p>
                </div>
              </ProgressRing>
            </CardContent>
          </Card>
        </section>

        {/* Subjects */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Your Subjects</h2>
            <span className="text-sm text-muted-foreground">
              {subjects.length} subjects
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                title={subject.title}
                icon={subject.icon}
                progress={subject.progress}
                lessonsCompleted={subject.lessonsCompleted}
                totalLessons={subject.totalLessons}
                color={subject.color}
                onClick={() => handleStartLesson(subject.id)}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Recent Activity
          </h2>
          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border p-0">
              <ActivityItem
                subject="Math"
                lesson="Understanding Fractions"
                score={4}
                total={5}
                time="2 hours ago"
                color="oklch(0.65 0.18 175)"
              />
              <ActivityItem
                subject="English"
                lesson="Reading Comprehension"
                score={5}
                total={5}
                time="Yesterday"
                color="oklch(0.75 0.15 280)"
              />
              <ActivityItem
                subject="Science"
                lesson="The Water Cycle"
                score={3}
                total={5}
                time="2 days ago"
                color="oklch(0.7 0.18 145)"
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function ActivityItem({
  subject,
  lesson,
  score,
  total,
  time,
  color,
}: {
  subject: string;
  lesson: string;
  score: number;
  total: number;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1">
        <p className="font-medium text-foreground">{lesson}</p>
        <p className="text-sm text-muted-foreground">{subject}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">
          {score}/{total}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

