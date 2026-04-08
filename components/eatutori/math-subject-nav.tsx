"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Calculator,
  PenTool,
  Plus,
  Minus,
  Shapes,
  Ruler,
  Clock,
  Coins,
  CheckCircle,
} from "lucide-react";

interface MathSubjectNavProps {
  gradeGroup: string;
  currentSubjectId?: string;
}

// Grade 1 Math subjects with proper mapping
const grade1MathSubjects = [
  {
    id: "1",
    actualId: "counting",
    name: "Counting",
    description: "Numbers 1-10",
    icon: <Calculator className="h-4 w-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    completedColor: "bg-blue-500",
  },
  {
    id: "2",
    actualId: "number-writing",
    name: "Writing Numbers",
    description: "Number formation",
    icon: <PenTool className="h-4 w-4" />,
    color: "text-green-600",
    bgColor: "bg-green-100",
    completedColor: "bg-green-500",
  },
  {
    id: "3",
    actualId: "addition-basic",
    name: "Adding",
    description: "Putting together",
    icon: <Plus className="h-4 w-4" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    completedColor: "bg-purple-500",
  },
  {
    id: "4",
    actualId: "subtraction-basic",
    name: "Taking Away",
    description: "Subtraction basics",
    icon: <Minus className="h-4 w-4" />,
    color: "text-red-600",
    bgColor: "bg-red-100",
    completedColor: "bg-red-500",
  },
  {
    id: "5",
    actualId: "shapes-patterns",
    name: "Shapes",
    description: "2D shapes & patterns",
    icon: <Shapes className="h-4 w-4" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    completedColor: "bg-orange-500",
  },
  {
    id: "6",
    actualId: "measurement-comparison",
    name: "Measuring",
    description: "Comparing sizes",
    icon: <Ruler className="h-4 w-4" />,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    completedColor: "bg-teal-500",
  },
  {
    id: "7",
    actualId: "time-sequencing",
    name: "Time",
    description: "Daily routines",
    icon: <Clock className="h-4 w-4" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    completedColor: "bg-indigo-500",
  },
  {
    id: "8",
    actualId: "money-basics",
    name: "Money",
    description: "Coins & buying",
    icon: <Coins className="h-4 w-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    completedColor: "bg-amber-500",
  },
];

export function MathSubjectNav({
  gradeGroup,
  currentSubjectId,
}: MathSubjectNavProps) {
  const pathname = usePathname();

  // For now, show all subjects as available
  // Later this could be connected to user progress
  const completedSubjects: string[] = [];

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📚 Grade 1 Mathematics Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {grade1MathSubjects.map((subject) => {
              const isActive = currentSubjectId === subject.actualId;
              const isCompleted = completedSubjects.includes(subject.actualId);
              const href = `/playground/${gradeGroup}/lesson/${subject.actualId}`;

              return (
                <Link key={subject.id} href={href} className="flex-shrink-0">
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "flex items-center gap-2 h-auto p-3 min-w-[120px] flex-col",
                      isActive && "ring-2 ring-blue-500 ring-offset-2",
                      !isActive && subject.color,
                      !isActive && subject.bgColor,
                      isCompleted && "border-green-500"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {subject.icon}
                      {isCompleted && (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{subject.name}</div>
                      <div className="text-xs opacity-70">
                        {subject.description}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calculator className="h-4 w-4" />
              <span>Math Progress:</span>
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (completedSubjects.length / grade1MathSubjects.length) * 100
                  }%`,
                }}
              />
            </div>
            <span className="text-xs">
              {completedSubjects.length} / {grade1MathSubjects.length} topics
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
