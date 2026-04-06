// Grade 1 Math Navigation Page for testing all subjects
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Hash,
  Plus,
  Minus,
  Shapes,
  Ruler,
  Clock,
  Coins,
  ArrowRight,
  Star,
} from "lucide-react";

const grade1MathSubjects = [
  {
    id: "counting",
    routeId: "1",
    title: "Counting",
    description: "Learn to count from 1 to 20",
    icon: Hash,
    color: "bg-blue-100 text-blue-600",
    progress: 0,
  },
  {
    id: "number-writing",
    routeId: "2",
    title: "Writing Numbers",
    description: "Practice writing numbers correctly",
    icon: Calculator,
    color: "bg-green-100 text-green-600",
    progress: 0,
  },
  {
    id: "addition-basic",
    routeId: "3",
    title: "Basic Addition",
    description: "Adding numbers up to 10",
    icon: Plus,
    color: "bg-purple-100 text-purple-600",
    progress: 0,
  },
  {
    id: "subtraction-basic",
    routeId: "4",
    title: "Basic Subtraction",
    description: "Subtracting numbers up to 10",
    icon: Minus,
    color: "bg-red-100 text-red-600",
    progress: 0,
  },
  {
    id: "shapes-patterns",
    routeId: "5",
    title: "Shapes & Patterns",
    description: "Identify basic shapes and patterns",
    icon: Shapes,
    color: "bg-orange-100 text-orange-600",
    progress: 0,
  },
  {
    id: "measurement-comparison",
    routeId: "6",
    title: "Size & Measurement",
    description: "Compare sizes and basic measurement",
    icon: Ruler,
    color: "bg-teal-100 text-teal-600",
    progress: 0,
  },
  {
    id: "time-sequencing",
    routeId: "7",
    title: "Time & Sequencing",
    description: "Basic time concepts and ordering",
    icon: Clock,
    color: "bg-indigo-100 text-indigo-600",
    progress: 0,
  },
  {
    id: "money-basics",
    routeId: "8",
    title: "Money Basics",
    description: "Recognizing coins and simple values",
    icon: Coins,
    color: "bg-amber-100 text-amber-600",
    progress: 0,
  },
];

export default function Grade1MathPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Grade 1 Mathematics</h1>
          <p className="text-muted-foreground">
            Comprehensive math curriculum covering all Cambridge KS1 objectives
          </p>
          <div className="mt-4">
            <Progress value={12.5} className="w-64 mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              1 of 8 topics completed
            </p>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {grade1MathSubjects.map((subject) => {
            const IconComponent = subject.icon;

            return (
              <Card
                key={subject.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Icon and Status */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${subject.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    {subject.progress > 0 && (
                      <div className="flex items-center text-green-600">
                        <Star className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">
                          {subject.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {subject.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {subject.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={subject.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{subject.progress}%</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link
                        href={`/playground/primary-early/lesson/${subject.routeId}`}
                      >
                        {subject.progress > 0 ? "Continue" : "Start"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>

                    {/* Test API button for debugging */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(
                          `/api/test-lesson-generation?grade=1&subjectId=${subject.id}`,
                          "_blank"
                        );
                      }}
                      className="text-xs"
                    >
                      Test API
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Cambridge Primary Mathematics Stage 1
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Number & Calculation
                </h4>
                <ul className="space-y-1 text-left">
                  <li>• Count and order numbers to 20</li>
                  <li>• Addition and subtraction to 10</li>
                  <li>• Number patterns and sequences</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Geometry & Measurement
                </h4>
                <ul className="space-y-1 text-left">
                  <li>• 2D and 3D shape recognition</li>
                  <li>• Comparing lengths and weights</li>
                  <li>• Time concepts and money basics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
