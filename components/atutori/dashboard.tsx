"use client";

import { useState } from "react";
import {
  Calculator,
  BookOpen,
  Microscope,
  Palette,
  Music,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XPBadge } from "./xp-badge";
import { ProgressRing } from "./progress-ring";
import { SubjectCard } from "./subject-card";

interface DashboardProps {
  studentName: string;
  onStartLesson: (subject: string) => void;
  onContinueLearning: () => void;
}

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

export function Dashboard({
  studentName,
  onStartLesson,
  onContinueLearning,
}: DashboardProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const totalProgress = Math.round(
    subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length
  );

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubject(subjectId);
    onStartLesson(subjectId);
  };

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
          <XPBadge xp={1250} level={5} />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row md:p-8">
              <div className="flex-1 text-center md:text-left">
                <h1 className="mb-2 text-2xl font-bold text-primary-foreground md:text-3xl">
                  Hi, {studentName}!
                </h1>
                <p className="mb-4 text-primary-foreground/90">
                  {
                    "You're doing amazing! Keep up the great work and earn more XP!"
                  }
                </p>
                <Button
                  onClick={onContinueLearning}
                  size="lg"
                  className="rounded-xl bg-white px-6 text-primary shadow-md hover:bg-white/90 hover:shadow-lg"
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

        {/* Subjects Section */}
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
                onClick={() => handleSubjectClick(subject.id)}
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

interface ActivityItemProps {
  subject: string;
  lesson: string;
  score: number;
  total: number;
  time: string;
  color: string;
}

function ActivityItem({
  subject,
  lesson,
  score,
  total,
  time,
  color,
}: ActivityItemProps) {
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

