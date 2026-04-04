"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Star,
  Rocket,
  Brain,
  Palette,
  Waves,
  TreePine,
  Candy,
  Sun,
  Snowflake,
  Check,
} from "lucide-react";
import {
  useTheme,
  themes,
  type ThemeName,
} from "@/components/eatutori/theme-provider";

type GradeGroup =
  | "primary-early"
  | "primary-mid"
  | "primary-upper"
  | "high-junior"
  | "high-senior";

interface GradeOption {
  grade: number;
  label: string;
  group: GradeGroup;
}

const gradeGroups: {
  id: GradeGroup;
  title: string;
  description: string;
  grades: GradeOption[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}[] = [
  {
    id: "primary-early",
    title: "Early Explorers",
    description: "Fun games and colorful adventures",
    grades: [
      { grade: 1, label: "Grade 1", group: "primary-early" },
      { grade: 2, label: "Grade 2", group: "primary-early" },
      { grade: 3, label: "Grade 3", group: "primary-early" },
    ],
    icon: <Star className="h-8 w-8" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    id: "primary-mid",
    title: "Growing Minds",
    description: "Discover new subjects and skills",
    grades: [
      { grade: 4, label: "Grade 4", group: "primary-mid" },
      { grade: 5, label: "Grade 5", group: "primary-mid" },
      { grade: 6, label: "Grade 6", group: "primary-mid" },
    ],
    icon: <Sparkles className="h-8 w-8" />,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    id: "primary-upper",
    title: "Rising Stars",
    description: "Prepare for bigger challenges",
    grades: [
      { grade: 7, label: "Grade 7", group: "primary-upper" },
      { grade: 8, label: "Grade 8", group: "primary-upper" },
    ],
    icon: <Rocket className="h-8 w-8" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    id: "high-junior",
    title: "Junior Scholars",
    description: "Deep dive into subjects",
    grades: [
      { grade: 9, label: "Grade 9", group: "high-junior" },
      { grade: 10, label: "Grade 10", group: "high-junior" },
    ],
    icon: <BookOpen className="h-8 w-8" />,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  {
    id: "high-senior",
    title: "Senior Achievers",
    description: "Master advanced concepts",
    grades: [
      { grade: 11, label: "Grade 11", group: "high-senior" },
      { grade: 12, label: "Grade 12", group: "high-senior" },
    ],
    icon: <GraduationCap className="h-8 w-8" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

const themeIcons: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-6 w-6" />,
  waves: <Waves className="h-6 w-6" />,
  trees: <TreePine className="h-6 w-6" />,
  candy: <Candy className="h-6 w-6" />,
  rocket: <Rocket className="h-6 w-6" />,
  sun: <Sun className="h-6 w-6" />,
  snowflake: <Snowflake className="h-6 w-6" />,
};

export function OnboardingClient() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState<"welcome" | "group" | "grade" | "theme">(
    "welcome"
  );
  const [selectedGroup, setSelectedGroup] = useState<GradeGroup | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }
    // If already onboarded, skip to playground
    fetch("/api/user/me", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.onboarded && data.gradeGroup) {
          router.replace(`/playground/${data.gradeGroup}`);
        }
      })
      .catch((error) => {
        console.error("Error fetching user onboarding status:", error);
      });
  }, [session, isPending, router]);

  const currentGroup = gradeGroups.find((g) => g.id === selectedGroup);

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const handleSelectGroup = (groupId: GradeGroup) => {
    setSelectedGroup(groupId);
    setStep("grade");
  };

  const handleSelectGrade = (grade: number) => {
    setSelectedGrade(grade);
    setStep("theme");
  };

  const handleSelectTheme = (themeName: ThemeName) => {
    setTheme(themeName);
  };

  const handleFinishOnboarding = async () => {
    setIsLoading(true);

    try {
      // Update user profile with grade info
      await fetch("/api/user/update-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedGrade,
          gradeGroup: selectedGroup,
        }),
      });

      // Hard navigate to bust any cached session state
      window.location.href = `/playground/${selectedGroup}`;
    } catch (error) {
      console.error("Failed to save grade:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Welcome Step */}
        {step === "welcome" && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Welcome to Eatutori!
            </h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              Your personal AI tutor is ready to help you learn. Let&apos;s set
              up your learning journey!
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-2xl"
              onClick={() => setStep("group")}
            >
              Get Started
            </Button>
          </div>
        )}

        {/* Grade Group Selection */}
        {step === "group" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Which group are you in?
              </h2>
              <p className="text-muted-foreground">
                Select your learning level to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradeGroups.map((group) => (
                <Card
                  key={group.id}
                  className={`p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${
                    selectedGroup === group.id
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => handleSelectGroup(group.id)}
                >
                  <div
                    className={`inline-flex p-3 rounded-xl ${group.bgColor} ${group.color} mb-4`}
                  >
                    {group.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {group.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {group.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Grades {group.grades[0].grade}-
                    {group.grades[group.grades.length - 1].grade}
                  </p>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={() => setStep("welcome")}>
                Go Back
              </Button>
            </div>
          </div>
        )}

        {/* Specific Grade Selection */}
        {step === "grade" && currentGroup && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center">
              <div
                className={`inline-flex p-4 rounded-2xl ${currentGroup.bgColor} ${currentGroup.color} mb-4`}
              >
                {currentGroup.icon}
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {currentGroup.title}
              </h2>
              <p className="text-muted-foreground">Select your exact grade</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {currentGroup.grades.map((gradeOption) => (
                <Button
                  key={gradeOption.grade}
                  variant={
                    selectedGrade === gradeOption.grade ? "default" : "outline"
                  }
                  size="lg"
                  className={`text-xl px-8 py-8 rounded-2xl min-w-[140px] ${
                    selectedGrade === gradeOption.grade ? "" : "hover:bg-accent"
                  }`}
                  onClick={() => handleSelectGrade(gradeOption.grade)}
                >
                  {gradeOption.label}
                </Button>
              ))}
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={() => setStep("group")}>
                Go Back
              </Button>
            </div>
          </div>
        )}

        {/* Theme Selection */}
        {step === "theme" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4">
                <Palette className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Pick Your Theme!
              </h2>
              <p className="text-muted-foreground">
                Choose your favorite colors for your learning adventure
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {themes.map((t) => (
                <Card
                  key={t.name}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    theme === t.name
                      ? "ring-2 ring-primary ring-offset-2 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => handleSelectTheme(t.name)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: t.preview[1] }}
                    >
                      <div style={{ color: t.preview[0] }}>
                        {themeIcons[t.icon]}
                      </div>
                    </div>
                    <p className="font-semibold text-sm text-center">
                      {t.label}
                    </p>
                    <div className="flex gap-1">
                      {t.preview.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {theme === t.name && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center space-y-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-2xl"
                onClick={handleFinishOnboarding}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">
                    Starting your journey...
                  </span>
                ) : (
                  "Start Learning!"
                )}
              </Button>
              <div>
                <Button variant="ghost" onClick={() => setStep("grade")}>
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

