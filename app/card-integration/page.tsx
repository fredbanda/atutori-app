"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Award,
  Target,
  Play,
  Settings,
  Layers,
  TrendingUp,
} from "lucide-react";

interface GradeCardConfig {
  grade: number;
  title: string;
  subtitle: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  cardTypes: {
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
    learningFlow: string[];
    status: "live" | "development" | "planned";
    testRoute?: string;
  }[];
  features: string[];
  progressExample: number;
}

const gradeConfigurations: GradeCardConfig[] = [
  {
    grade: 1,
    title: "Foundation Cards",
    subtitle: "Building Blocks of Learning",
    theme: {
      primary: "from-amber-400 to-orange-500",
      secondary: "bg-amber-100",
      accent: "text-amber-600",
    },
    cardTypes: [
      {
        name: "NumberCards",
        icon: <Calculator className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        description: "Numbers 1-10 with counting and recognition",
        learningFlow: ["See", "Hear", "Say", "Trace", "Master"],
        status: "live",
        testRoute: "/test/simple-numbers",
      },
      {
        name: "LetterCards",
        icon: <BookOpen className="h-5 w-5" />,
        color: "text-green-600",
        bgColor: "bg-green-100",
        description: "Alphabet A-Z with phonics and word building",
        learningFlow: [
          "See",
          "Hear",
          "Phonics",
          "Say",
          "Trace",
          "Word",
          "Master",
        ],
        status: "live",
        testRoute: "/test/letter-cards",
      },
      {
        name: "ScienceCards",
        icon: <FlaskConical className="h-5 w-5" />,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        description: "Animals, plants, and basic science concepts",
        learningFlow: ["See", "Hear", "Explore", "Experiment", "Learn"],
        status: "development",
      },
      {
        name: "ArtCards",
        icon: <Palette className="h-5 w-5" />,
        color: "text-pink-600",
        bgColor: "bg-pink-100",
        description: "Colors, shapes, and creative expression",
        learningFlow: ["See", "Hear", "Imagine", "Create", "Share"],
        status: "planned",
      },
    ],
    features: [
      "Slower pacing (0.7x speed)",
      "Visual object counting",
      "Simple phonics sounds",
      "Large, clear displays",
      "Encouraging feedback",
    ],
    progressExample: 85,
  },
  {
    grade: 2,
    title: "Building Cards",
    subtitle: "Expanding Understanding",
    theme: {
      primary: "from-blue-400 to-indigo-500",
      secondary: "bg-blue-100",
      accent: "text-blue-600",
    },
    cardTypes: [
      {
        name: "NumberCards+",
        icon: <Calculator className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        description: "Numbers 1-20, simple addition and subtraction",
        learningFlow: ["See", "Hear", "Calculate", "Practice", "Master"],
        status: "planned",
      },
      {
        name: "WordCards",
        icon: <BookOpen className="h-5 w-5" />,
        color: "text-green-600",
        bgColor: "bg-green-100",
        description: "Sight words, simple sentences, reading comprehension",
        learningFlow: ["See", "Hear", "Read", "Understand", "Apply"],
        status: "planned",
      },
      {
        name: "ScienceCards+",
        icon: <FlaskConical className="h-5 w-5" />,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        description: "Weather, seasons, simple experiments",
        learningFlow: ["See", "Hear", "Hypothesize", "Test", "Conclude"],
        status: "planned",
      },
      {
        name: "GeographyCards",
        icon: <Globe className="h-5 w-5" />,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        description: "Maps, countries, communities",
        learningFlow: ["See", "Hear", "Explore", "Navigate", "Connect"],
        status: "planned",
      },
    ],
    features: [
      "Medium pacing (0.8x speed)",
      "Complex problem solving",
      "Interactive elements",
      "Progress tracking",
      "Adaptive difficulty",
    ],
    progressExample: 0,
  },
  {
    grade: 3,
    title: "Advanced Cards",
    subtitle: "Mastering Concepts",
    theme: {
      primary: "from-purple-400 to-pink-500",
      secondary: "bg-purple-100",
      accent: "text-purple-600",
    },
    cardTypes: [
      {
        name: "MathCards",
        icon: <Calculator className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        description: "Multiplication, division, fractions",
        learningFlow: ["See", "Hear", "Analyze", "Solve", "Apply"],
        status: "planned",
      },
      {
        name: "LanguageCards",
        icon: <BookOpen className="h-5 w-5" />,
        color: "text-green-600",
        bgColor: "bg-green-100",
        description: "Grammar, writing, creative expression",
        learningFlow: ["See", "Hear", "Compose", "Edit", "Present"],
        status: "planned",
      },
      {
        name: "STEMCards",
        icon: <Brain className="h-5 w-5" />,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        description: "Technology, engineering thinking, coding basics",
        learningFlow: ["See", "Hear", "Design", "Build", "Iterate"],
        status: "planned",
      },
      {
        name: "CriticalCards",
        icon: <Puzzle className="h-5 w-5" />,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        description: "Logic puzzles, critical thinking, problem solving",
        learningFlow: ["See", "Hear", "Analyze", "Deduce", "Solve"],
        status: "planned",
      },
    ],
    features: [
      "Faster pacing (0.9x speed)",
      "Complex reasoning",
      "Multi-step problems",
      "Peer collaboration",
      "Real-world applications",
    ],
    progressExample: 0,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "live":
      return "bg-green-500 text-white";
    case "development":
      return "bg-yellow-500 text-white";
    case "planned":
      return "bg-gray-400 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "live":
      return "🎉 Live";
    case "development":
      return "🚧 In Development";
    case "planned":
      return "📋 Planned";
    default:
      return "Unknown";
  }
};

export default function CardIntegrationHub() {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const selectedConfig = gradeConfigurations.find(
    (c) => c.grade === selectedGrade
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Grade 1-3 Card Integration Blueprint
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive roadmap showing how our revolutionary card system
            scales across Grade levels. Use Grade 1 as the foundation to build
            Grades 2-3.
          </p>
        </div>

        {/* Grade Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-2 shadow-md flex gap-2">
            {gradeConfigurations.map((config) => (
              <button
                key={config.grade}
                onClick={() => setSelectedGrade(config.grade)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedGrade === config.grade
                    ? `bg-gradient-to-r ${config.theme.primary} text-white shadow-lg`
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Grade {config.grade}
              </button>
            ))}
          </div>
        </div>

        {selectedConfig && (
          <div className="max-w-6xl mx-auto">
            {/* Grade Overview */}
            <Card className="p-8 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Grade Info */}
                <div className="lg:col-span-1">
                  <div className="text-center lg:text-left">
                    <div
                      className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${selectedConfig.theme.primary} text-white mb-4`}
                    >
                      <GraduationCap className="h-6 w-6" />
                      <span className="font-bold text-lg">
                        Grade {selectedConfig.grade}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedConfig.title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {selectedConfig.subtitle}
                    </p>

                    {selectedConfig.progressExample > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">
                            Implementation Status
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                          {selectedConfig.progressExample}%
                        </div>
                        <div className="text-sm text-green-700">
                          Complete & Working!
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="lg:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Grade-Specific Features:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedConfig.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Card Types */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {selectedConfig.title} - Card Types
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {selectedConfig.cardTypes.map((cardType, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${cardType.bgColor} ${cardType.color}`}
                    >
                      {cardType.icon}
                    </div>
                    <Badge className={getStatusColor(cardType.status)}>
                      {getStatusText(cardType.status)}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {cardType.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{cardType.description}</p>

                  {/* Learning Flow */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Learning Flow:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cardType.learningFlow.map((step, stepIndex) => (
                        <span
                          key={step}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {stepIndex + 1}. {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {cardType.testRoute ? (
                    <Button
                      onClick={() => window.open(cardType.testRoute, "_blank")}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test Live
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      {cardType.status === "development"
                        ? "In Development"
                        : "Coming Soon"}
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            {/* Development Roadmap */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                🚀 Development Roadmap
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Completed */}
                <div className="text-center">
                  <div className="bg-green-100 p-6 rounded-xl">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="font-bold text-green-800 mb-2">
                      Grade 1 Complete
                    </div>
                    <div className="text-sm text-green-700">
                      NumberCards & LetterCards fully implemented and tested
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                <div className="text-center">
                  <div className="bg-yellow-100 p-6 rounded-xl">
                    <div className="text-3xl mb-2">🚧</div>
                    <div className="font-bold text-yellow-800 mb-2">
                      Grade 2-3 Framework
                    </div>
                    <div className="text-sm text-yellow-700">
                      Architecture ready, need to implement specific card types
                    </div>
                  </div>
                </div>

                {/* Planned */}
                <div className="text-center">
                  <div className="bg-blue-100 p-6 rounded-xl">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="font-bold text-blue-800 mb-2">
                      Full Integration
                    </div>
                    <div className="text-sm text-blue-700">
                      All subjects integrated into main curriculum
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mt-8 border-t pt-6">
                <h4 className="font-bold text-gray-800 mb-4 text-center">
                  🎯 Next Implementation Steps:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Grade 2 Extension:</strong>
                    <ul className="list-disc list-inside ml-4 text-gray-600">
                      <li>Adapt NumberCards for 1-20</li>
                      <li>Create WordCards component</li>
                      <li>Increase pace to 0.8x speed</li>
                      <li>Add complexity layers</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Grade 3 Enhancement:</strong>
                    <ul className="list-disc list-inside ml-4 text-gray-600">
                      <li>Build MathCards for operations</li>
                      <li>Develop STEMCards system</li>
                      <li>Optimize for 0.9x speed</li>
                      <li>Add collaborative features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Access */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            🚀 Quick Access
          </h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              onClick={() => window.open("/grade1-cards", "_blank")}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <Star className="h-5 w-5 mr-2" />
              Grade 1 Dashboard
            </Button>
            <Button
              onClick={() => window.open("/test/simple-numbers", "_blank")}
              size="lg"
              variant="outline"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Test NumberCards
            </Button>
            <Button
              onClick={() => window.open("/test/letter-cards", "_blank")}
              size="lg"
              variant="outline"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Test LetterCards
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
