// Main Playground Page - Overview of all subjects and grades
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  BookOpen,
  Code,
  Puzzle,
  ArrowRight,
  Star,
  GraduationCap,
  Users,
} from "lucide-react";

const playgroundSubjects = [
  {
    id: "math",
    title: "Mathematics",
    description: "Complete Cambridge Primary Mathematics curriculum",
    icon: Calculator,
    color: "bg-blue-100 text-blue-600",
    grades: {
      "primary-early": {
        title: "Grade 1-3",
        topics: [
          "Counting",
          "Number Writing",
          "Basic Addition",
          "Subtraction",
          "Shapes",
          "Measurement",
          "Time",
          "Money",
        ],
        href: "/playground/primary-early/math",
      },
      "primary-mid": {
        title: "Grade 4-6",
        topics: [
          "Multiplication",
          "Division",
          "Fractions",
          "Decimals",
          "Geometry",
          "Data",
        ],
        href: "/playground/primary-mid",
      },
    },
    featured: true,
  },
  {
    id: "reading",
    title: "Reading & Literacy",
    description: "Phonics, comprehension, and language skills",
    icon: BookOpen,
    color: "bg-green-100 text-green-600",
    grades: {
      "primary-early": {
        title: "Grade 1-3",
        topics: ["Phonics", "Sight Words", "Story Reading", "Comprehension"],
        href: "/playground/primary-early",
      },
    },
    featured: false,
  },
  {
    id: "coding",
    title: "Programming",
    description: "Introduction to coding and computational thinking",
    icon: Code,
    color: "bg-purple-100 text-purple-600",
    grades: {
      "primary-mid": {
        title: "Grade 4-6",
        topics: ["Logic", "Sequences", "Variables", "Functions"],
        href: "/playground/primary-mid",
      },
    },
    featured: false,
  },
  {
    id: "puzzles",
    title: "Logic & Puzzles",
    description: "Critical thinking and problem-solving challenges",
    icon: Puzzle,
    color: "bg-orange-100 text-orange-600",
    grades: {
      "primary-upper": {
        title: "Grade 7-8",
        topics: ["Logic Puzzles", "Pattern Recognition", "Strategy Games"],
        href: "/playground/primary-upper",
      },
    },
    featured: false,
  },
];

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Interactive Learning Playground
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4">AI-Powered Education</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Personalized lessons powered by advanced AI, following the Cambridge
            International Curriculum. Every lesson is uniquely generated for
            optimal learning.
          </p>
        </div>

        {/* Featured Subject - Mathematics */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold">Featured Subject</h2>
            <Star className="h-6 w-6 text-amber-500" />
          </div>

          {playgroundSubjects
            .filter((subject) => subject.featured)
            .map((subject) => {
              const IconComponent = subject.icon;

              return (
                <Card
                  key={subject.id}
                  className="p-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Subject Info */}
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-4 rounded-xl ${subject.color}`}>
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            {subject.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {subject.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(subject.grades).map(
                          ([gradeKey, gradeInfo]) => (
                            <Card key={gradeKey} className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">
                                  {gradeInfo.title}
                                </h4>
                                <Badge variant="secondary">
                                  {gradeInfo.topics.length} Topics
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {gradeInfo.topics.slice(0, 3).join(", ")}
                                {gradeInfo.topics.length > 3 && "..."}
                              </p>
                              <Button asChild size="sm" className="w-full">
                                <Link href={gradeInfo.href}>
                                  Explore Grade {gradeInfo.title}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                              </Button>
                            </Card>
                          )
                        )}
                      </div>
                    </div>

                    {/* Stats/Features */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-white/50 rounded-xl">
                          <div className="text-2xl font-bold text-primary">
                            8
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Grade 1 Topics
                          </div>
                        </div>
                        <div className="p-4 bg-white/50 rounded-xl">
                          <div className="text-2xl font-bold text-primary">
                            ∞
                          </div>
                          <div className="text-sm text-muted-foreground">
                            AI Lessons
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span>
                            Cambridge International Curriculum aligned
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <span>Personalized AI-generated lessons</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                          <span>Interactive quizzes and activities</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>

        {/* All Subjects Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">All Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playgroundSubjects.map((subject) => {
              const IconComponent = subject.icon;

              return (
                <Card
                  key={subject.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${subject.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{subject.title}</h3>
                        {subject.featured && (
                          <Badge variant="default" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                      {subject.description}
                    </p>

                    {/* Grade Levels */}
                    <div className="space-y-2">
                      {Object.entries(subject.grades).map(
                        ([gradeKey, gradeInfo]) => (
                          <div
                            key={gradeKey}
                            className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded"
                          >
                            <div>
                              <div className="font-medium text-sm">
                                {gradeInfo.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {gradeInfo.topics.length} topics available
                              </div>
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link href={gradeInfo.href}>View</Link>
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Ready to Start Learning?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of students already learning with our AI-powered
            curriculum. Each lesson is personalized and aligned with
            international education standards.
          </p>
          <Button asChild size="lg">
            <Link href="/playground/primary-early/math">
              Start with Grade 1 Math
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
