"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Star,
  Lightbulb,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  generateLesson,
  recordLessonAttempt,
  type GeneratedLesson,
  type QuizStep,
} from "@/lib/generate-lesson";

// ── Types ──────────────────────────────────────
type QuizAnswer = {
  questionIndex: number;
  selected: number;
  correct: boolean;
};

// ── Component ──────────────────────────────────
export default function LessonPage({
  params,
}: {
  params: Promise<{ gradeGroup: string; subjectId: string }>;
}) {
  const { gradeGroup, subjectId } = use(params);
  const router = useRouter();

  // Derive numeric grade from gradeGroup
  // gradeGroup pattern: "primary-early" = grade 1, "primary-mid" = grade 3, etc.
  // Adjust this map to match your actual gradeGroup → grade mapping
  const gradeFromGroup: Record<string, number> = {
    "primary-early": 1,
    "primary-mid": 3,
    "primary-upper": 5,
    "high-junior": 7,
    "high-senior": 10,
  };
  const grade = gradeFromGroup[gradeGroup] ?? 1;

  // ── Lesson state ────────────────────────────
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [cacheId, setCacheId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  // ── Progress state ──────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [startedAt] = useState(Date.now());

  // ── Load lesson on mount ────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setLoadError(null);
        const result = await generateLesson(grade, subjectId);
        setLesson(result.lesson);
        setCacheId(result.cacheId);
        setFromCache(result.fromCache);
      } catch (err) {
        setLoadError(
          err instanceof Error
            ? err.message
            : "Could not load lesson. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [grade, subjectId]);

  // ── Loading screen ──────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium text-foreground">
            {fromCache
              ? "Loading your lesson..."
              : "Creating your lesson... ✨"}
          </p>
          <p className="text-sm text-muted-foreground">
            {fromCache
              ? "Just a moment!"
              : "Our AI tutor is preparing something special for you!"}
          </p>
        </div>
      </div>
    );
  }

  // ── Error screen ────────────────────────────
  if (loadError || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <p className="text-2xl">😕</p>
          <h2 className="text-xl font-bold text-foreground">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm">{loadError}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/playground/${gradeGroup}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Derived lesson values ───────────────────
  const steps = lesson.steps;
  const currentLesson = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isQuiz = currentLesson.type === "quiz";
  const isLastStep = currentStep === steps.length - 1;
  const totalQuizSteps = steps.filter((s) => s.type === "quiz").length;

  // ── Handlers ────────────────────────────────
  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowHint(false);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || currentLesson.type !== "quiz") return;
    const quizStep = currentLesson as QuizStep;
    const isCorrect = selectedAnswer === quizStep.correctAnswer;
    const quizIndex =
      steps.slice(0, currentStep + 1).filter((s) => s.type === "quiz").length -
      1;

    setShowResult(true);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      setXpEarned((prev) => prev + 10);
    } else {
      // Show hint on wrong answer if one exists
      if (quizStep.hint) setShowHint(true);
    }

    setAnswers((prev) => [
      ...prev,
      {
        questionIndex: quizIndex,
        selected: selectedAnswer,
        correct: isCorrect,
      },
    ]);
  };

  const handleNext = async () => {
    if (isLastStep) {
      // Record the completed attempt
      const durationSeconds = Math.floor((Date.now() - startedAt) / 1000);

      // Fire-and-forget — don't block navigation
      recordLessonAttempt({
        userId: "TODO_REPLACE_WITH_SESSION_USER_ID", // replace with useSession or auth()
        cacheId,
        subjectId,
        grade,
        cambridgeStage: lesson.cambridgeStage,
        score: correctAnswers,
        totalQuestions: totalQuizSteps,
        xpEarned,
        answers,
        durationSeconds,
      }).catch(console.error);

      router.push(
        `/playground/${gradeGroup}/lesson/${subjectId}/results` +
          `?correct=${correctAnswers}&total=${totalQuizSteps}&xp=${xpEarned}`
      );
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    }
  };

  // ── Render ───────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/playground/${gradeGroup}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
            <h1 className="font-bold text-foreground truncate max-w-[200px]">
              {lesson.title}
            </h1>
            <div className="flex items-center gap-2 text-amber-500">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold">+{xpEarned} XP</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {currentStep + 1} of {steps.length}
            {fromCache && (
              <span className="ml-2 text-xs opacity-50">⚡ cached</span>
            )}
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {currentLesson.type === "content" ? (
          /* ── Content step ── */
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
                <p className="text-foreground font-medium text-lg">
                  {currentLesson.example}
                </p>
              </div>
            )}
            <Button size="lg" className="w-full" onClick={handleNext}>
              {isLastStep ? "Complete Lesson" : "Continue"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Card>
        ) : (
          /* ── Quiz step ── */
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {(currentLesson as QuizStep).question}
            </h2>

            <div className="space-y-4 mb-6">
              {(currentLesson as QuizStep).options.map((option, index) => {
                const quizStep = currentLesson as QuizStep;
                let buttonStyle =
                  "border-2 border-border bg-card hover:border-primary hover:bg-accent";

                if (showResult) {
                  if (index === quizStep.correctAnswer) {
                    buttonStyle =
                      "border-2 border-green-500 bg-green-50 text-green-700";
                  } else if (
                    index === selectedAnswer &&
                    selectedAnswer !== quizStep.correctAnswer
                  ) {
                    buttonStyle =
                      "border-2 border-red-500 bg-red-50 text-red-700";
                  }
                } else if (selectedAnswer === index) {
                  buttonStyle = "border-2 border-primary bg-primary/10";
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
                      {showResult &&
                        index === (currentLesson as QuizStep).correctAnswer && (
                          <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                        )}
                      {showResult &&
                        index === selectedAnswer &&
                        selectedAnswer !==
                          (currentLesson as QuizStep).correctAnswer && (
                          <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                        )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hint — shown on wrong answer before explanation */}
            {showHint && (currentLesson as QuizStep).hint && !showResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  💡 {(currentLesson as QuizStep).hint}
                </p>
              </div>
            )}

            {/* Explanation — shown after answering */}
            {showResult && (currentLesson as QuizStep).explanation && (
              <div
                className={`rounded-xl p-4 mb-6 ${
                  selectedAnswer === (currentLesson as QuizStep).correctAnswer
                    ? "bg-green-50 border border-green-200"
                    : "bg-amber-50 border border-amber-200"
                }`}
              >
                <p className="text-foreground">
                  {(currentLesson as QuizStep).explanation}
                </p>
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
                {isLastStep ? "See Results 🎉" : "Next"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
