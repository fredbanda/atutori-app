"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { recordLessonAttempt } from "@/lib/generate-lesson";
import { useSession } from "@/lib/auth-client";
import {
  ArrowRight,
  RotateCcw,
  Home,
  Star,
  Trophy,
  Flame,
  BookOpen,
} from "lucide-react";

// ── Grade group → next subject suggestion ──────
const subjectSuggestions: Record<string, { id: string; label: string }[]> = {
  "primary-early": [
    { id: "math", label: "Maths" },
    { id: "english", label: "English" },
  ],
  "primary-mid": [
    { id: "math", label: "Maths" },
    { id: "science", label: "Science" },
    { id: "english", label: "English" },
  ],
  "primary-upper": [
    { id: "math", label: "Maths" },
    { id: "science", label: "Science" },
    { id: "english", label: "English" },
  ],
  "high-junior": [
    { id: "math", label: "Maths" },
    { id: "science", label: "Science" },
    { id: "english", label: "English" },
  ],
  "high-senior": [
    { id: "math", label: "Maths" },
    { id: "science", label: "Science" },
  ],
};

// ── XP thresholds per grade level ─────────────
function getLevelFromXp(xp: number): {
  level: number;
  progress: number;
  nextAt: number;
} {
  const thresholds = [0, 50, 120, 220, 360, 550, 800, 1100, 1500, 2000];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  const currentAt = thresholds[level - 1] ?? 0;
  const nextAt = thresholds[level] ?? thresholds[thresholds.length - 1] + 500;
  const progress = Math.min(
    100,
    Math.round(((xp - currentAt) / (nextAt - currentAt)) * 100)
  );
  return { level, progress, nextAt };
}

// ── Result rating ──────────────────────────────
function getRating(correct: number, total: number) {
  const pct = total > 0 ? correct / total : 0;
  if (pct === 1)
    return { emoji: "🏆", label: "Perfect score!", color: "text-amber-500" };
  if (pct >= 0.67)
    return { emoji: "⭐", label: "Great job!", color: "text-green-500" };
  if (pct >= 0.34)
    return { emoji: "💪", label: "Good effort!", color: "text-blue-500" };
  return { emoji: "🌱", label: "Keep practising!", color: "text-purple-500" };
}

// ── Animated counter hook ──────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 40;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setValue(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ── Component ──────────────────────────────────
export default function ResultsPage({
  params,
}: {
  params: Promise<{ gradeGroup: string; subjectId: string }>;
}) {
  const { gradeGroup, subjectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const correct = parseInt(searchParams.get("correct") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "3");
  const xpEarned = parseInt(searchParams.get("xp") ?? "0");
  const cacheId = searchParams.get("cacheId") ?? "";
  const duration = parseInt(searchParams.get("duration") ?? "0");

  // Record attempt once on mount
  useEffect(() => {
    if (!session?.user?.id || !cacheId) return;
    recordLessonAttempt({
      userId: session.user.id,
      cacheId,
      subjectId,
      grade: gradeGroup === "primary-early" ? 1 : gradeGroup === "primary-mid" ? 4 : 7,
      cambridgeStage: "KS1",
      score: correct,
      totalQuestions: total,
      xpEarned,
      answers: [],
      durationSeconds: duration || undefined,
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use real XP from session + earned this lesson
  const totalXp = (session?.user as { xp?: number })?.xp ?? xpEarned;
  const { level, progress: levelProgress } = getLevelFromXp(totalXp);

  const rating = getRating(correct, total);
  const animatedXp = useCountUp(xpEarned);
  const animatedCorrect = useCountUp(correct);

  const suggestions = (subjectSuggestions[gradeGroup] ?? []).filter(
    (s) => s.id !== subjectId
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* ── Rating card ── */}
        <Card className="p-8 text-center space-y-3">
          <div className="text-6xl mb-2">{rating.emoji}</div>
          <h1 className={`text-2xl font-bold ${rating.color}`}>
            {rating.label}
          </h1>
          <p className="text-muted-foreground text-sm">
            You answered{" "}
            <span className="font-bold text-foreground">
              {animatedCorrect} out of {total}
            </span>{" "}
            questions correctly
          </p>

          {/* Score dots */}
          <div className="flex justify-center gap-3 pt-2">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full transition-all duration-500 ${
                  i < correct ? "bg-green-500" : "bg-muted"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </Card>

        {/* ── XP card ── */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-current" />
              <span className="font-semibold text-foreground">XP Earned</span>
            </div>
            <span className="text-2xl font-bold text-amber-500">
              +{animatedXp}
            </span>
          </div>

          {/* Level progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Level {level}
              </span>
              <span>{levelProgress}% to next level</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Streak nudge */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1 border-t">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>Come back tomorrow to keep your streak going! 🔥</span>
          </div>
        </Card>

        {/* ── Actions ── */}
        <div className="space-y-3">
          {/* Try a different lesson of the same subject */}
          <Button
            size="lg"
            className="w-full"
            onClick={() =>
              router.push(
                `/playground/${gradeGroup}/lesson/${subjectId}?refresh=1`
              )
            }
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Try a fresh lesson
          </Button>

          {/* Suggest another subject */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">
                Or jump to another subject
              </p>
              <div className="flex gap-2">
                {suggestions.slice(0, 2).map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/playground/${gradeGroup}/lesson/${s.id}`)
                    }
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Back to playground */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push(`/playground/${gradeGroup}`)}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to playground
          </Button>
        </div>
      </div>
    </div>
  );
}
