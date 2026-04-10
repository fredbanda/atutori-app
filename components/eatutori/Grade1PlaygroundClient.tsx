"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  BookOpen,
  FlaskConical,
  Palette,
  Music,
  Globe,
  Puzzle,
  Star,
  ChevronRight,
  Sparkles,
  Rocket,
  GraduationCap,
  Brain,
  Play,
  Award,
  Target,
  Clock,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  grade: number;
  gradeGroup: string;
  level: number;
  xp: number;
  streakDays: number;
}

interface CardSubject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  cardType:
    | "NumberCard"
    | "LetterCard"
    | "ScienceCard"
    | "ArtCard"
    | "MusicCard"
    | "PuzzleCard"
    | "WorldCard";
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  description: string;
  learningFlow: string[];
  testRoute: string;
  playgroundRoute: string;
}

// Grade 1 Card-Based Subjects
const grade1CardSubjects: CardSubject[] = [
  {
    id: "math",
    name: "NumberCards",
    icon: <Calculator className="h-6 w-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    cardType: "NumberCard",
    progress: 85,
    lessonsCompleted: 17,
    totalLessons: 20,
    description: "Master numbers 1-10 with our revolutionary learning cards",
    learningFlow: ["See", "Hear", "Say", "Trace", "Master"],
    testRoute: "/test/simple-numbers",
    playgroundRoute: "/playground/primary-early/lesson/counting",
  },
  {
    id: "english",
    name: "LetterCards",
    icon: <BookOpen className="h-6 w-6" />,
    color: "text-green-600",
    bgColor: "bg-green-100",
    cardType: "LetterCard",
    progress: 92,
    lessonsCompleted: 24,
    totalLessons: 26,
    description: "Learn the alphabet with phonics and word building",
    learningFlow: ["See", "Hear", "Phonics", "Say", "Trace", "Word", "Master"],
    testRoute: "/test/letter-cards",
    playgroundRoute: "/playground/primary-early/lesson/english",
  },
  {
    id: "science",
    name: "ScienceCards",
    icon: <FlaskConical className="h-6 w-6" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    cardType: "ScienceCard",
    progress: 35,
    lessonsCompleted: 7,
    totalLessons: 20,
    description: "Discover amazing facts about animals, plants, and nature",
    learningFlow: ["See", "Hear", "Explore", "Experiment", "Learn"],
    testRoute: "/test/science-cards",
    playgroundRoute: "/playground/primary-early/lesson/science",
  },
  {
    id: "art",
    name: "ArtCards",
    icon: <Palette className="h-6 w-6" />,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    cardType: "ArtCard",
    progress: 60,
    lessonsCompleted: 12,
    totalLessons: 20,
    description:
      "Create beautiful art while learning colors, shapes, and creativity",
    learningFlow: ["See", "Hear", "Imagine", "Create", "Share"],
    testRoute: "/test/art-cards",
    playgroundRoute: "/playground/primary-early/lesson/art",
  },
  {
    id: "music",
    name: "MusicCards",
    icon: <Music className="h-6 w-6" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    cardType: "MusicCard",
    progress: 45,
    lessonsCompleted: 9,
    totalLessons: 20,
    description:
      "Feel the rhythm and learn about beats, instruments, and sounds",
    learningFlow: ["See", "Hear", "Sing", "Move", "Perform"],
    testRoute: "/test/music-cards",
    playgroundRoute: "/playground/primary-early/lesson/music",
  },
  {
    id: "puzzles",
    name: "PuzzleCards",
    icon: <Puzzle className="h-6 w-6" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    cardType: "PuzzleCard",
    progress: 70,
    lessonsCompleted: 14,
    totalLessons: 20,
    description: "Solve fun puzzles and develop logical thinking skills",
    learningFlow: ["See", "Hear", "Think", "Solve", "Celebrate"],
    testRoute: "/test/puzzle-cards",
    playgroundRoute: "/playground/primary-early/lesson/puzzles",
  },
  {
    id: "world",
    name: "WorldCards",
    icon: <Globe className="h-6 w-6" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    cardType: "WorldCard",
    progress: 25,
    lessonsCompleted: 5,
    totalLessons: 20,
    description:
      "Explore different cultures, places, and communities around the world",
    learningFlow: ["See", "Hear", "Discover", "Connect", "Wonder"],
    testRoute: "/test/world-cards",
    playgroundRoute: "/playground/primary-early/lesson/world",
  },
];

interface Grade1PlaygroundClientProps {
  user: User;
}

export function Grade1PlaygroundClient({ user }: Grade1PlaygroundClientProps) {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<CardSubject | null>(
    null
  );

  const handleStartLesson = (subjectId: string) => {
    const subject = grade1CardSubjects.find((s) => s.id === subjectId);
    if (subject) {
      router.push(subject.playgroundRoute);
    }
  };

  const handleTestCard = (subjectId: string) => {
    const subject = grade1CardSubjects.find((s) => s.id === subjectId);
    if (subject) {
      router.push(subject.testRoute);
    }
  };

  const getOverallProgress = () => {
    const totalCompleted = grade1CardSubjects.reduce(
      (sum, subject) => sum + subject.lessonsCompleted,
      0
    );
    const totalLessons = grade1CardSubjects.reduce(
      (sum, subject) => sum + subject.totalLessons,
      0
    );
    return Math.round((totalCompleted / totalLessons) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="h-10 w-10 text-amber-500" />
            <h1 className="text-4xl font-bold text-gray-800">
              Grade 1 Learning Cards
            </h1>
            <Star className="h-10 w-10 text-amber-500" />
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Welcome back, {user.name}! Ready for some amazing card-based
            learning?
          </p>

          {/* Progress Overview */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl font-bold text-amber-600">
                {getOverallProgress()}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl font-bold text-green-600">
                {user.streakDays}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl font-bold text-blue-600">{user.xp}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl font-bold text-purple-600">
                {user.level}
              </div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
          </div>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {grade1CardSubjects.map((subject) => (
            <Card
              key={subject.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${subject.bgColor} ${subject.color}`}
                  >
                    {subject.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="text-lg font-bold text-gray-800">
                      {subject.progress}%
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {subject.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {subject.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <Progress value={subject.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{subject.lessonsCompleted} completed</span>
                    <span>{subject.totalLessons} total</span>
                  </div>
                </div>

                {/* Learning Flow */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Learning Flow:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {subject.learningFlow.map((step, index) => (
                      <span
                        key={step}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {index + 1}. {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStartLesson(subject.id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Learn
                  </Button>
                  <Button
                    onClick={() => handleTestCard(subject.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Numbers Practice */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">Numbers 1-10</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Practice counting and number recognition
                </p>
                <Button
                  onClick={() => router.push("/test/simple-numbers")}
                  className="w-full"
                >
                  Start NumberCards
                </Button>
              </div>
            </Card>

            {/* Alphabet Practice */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Alphabet A-Z</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Learn letters, sounds, and words
                </p>
                <Button
                  onClick={() => router.push("/test/letter-cards")}
                  className="w-full"
                >
                  Start LetterCards
                </Button>
              </div>
            </Card>

            {/* Complete Dashboard */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Full Dashboard</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Access all subjects and features
                </p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="w-full"
                >
                  Open Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            🏆 Your Achievements
          </h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {user.streakDays >= 3 && (
              <div className="bg-yellow-100 px-4 py-2 rounded-full flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  3-Day Streak!
                </span>
              </div>
            )}
            {user.xp >= 500 && (
              <div className="bg-blue-100 px-4 py-2 rounded-full flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">XP Champion!</span>
              </div>
            )}
            {getOverallProgress() >= 50 && (
              <div className="bg-green-100 px-4 py-2 rounded-full flex items-center gap-2">
                <Rocket className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Learning Rocket!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
