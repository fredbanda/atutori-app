"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/eatutori/video-player";
import { VideoQuiz } from "@/components/eatutori/video-quiz";
import { Loader2 } from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  gradeGroup: string;
  subjectId: string | null;
  watched: boolean;
  quizCompleted: boolean;
  quizScore: number | null;
}

type ViewMode = "video" | "quiz";

export default function VideoLessonPage() {
  const params = useParams();
  const router = useRouter();
  const gradeGroup = params.gradeGroup as string;
  const mediaId = params.mediaId as string;

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("video");

  useEffect(() => {
    async function fetchMedia() {
      try {
        const response = await fetch("/api/media");
        if (!response.ok) throw new Error("Failed to fetch media");
        const data = await response.json();
        const found = data.media?.find((m: MediaItem) => m.id === mediaId);
        setMedia(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [mediaId]);

  const handleVideoComplete = async () => {
    // Mark video as watched in the database
    try {
      await fetch("/api/media/mark-watched", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
    } catch (err) {
      console.error("Failed to mark video as watched:", err);
    }
  };

  const handleQuizComplete = async (score: number) => {
    // Save quiz score to database
    try {
      await fetch("/api/media/save-quiz-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, score }),
      });
    } catch (err) {
      console.error("Failed to save quiz score:", err);
    }
  };

  const handleBack = () => {
    if (viewMode === "quiz") {
      setViewMode("video");
    } else {
      router.push(`/playground/${gradeGroup}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-medium mb-4">Video not found</p>
        <button
          onClick={() => router.push(`/playground/${gradeGroup}`)}
          className="text-primary underline"
        >
          Go back to playground
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {viewMode === "video" ? (
          <VideoPlayer
            mediaId={media.id}
            title={media.title}
            description={media.description}
            url={media.url}
            onComplete={handleVideoComplete}
            onStartQuiz={() => setViewMode("quiz")}
            onBack={handleBack}
          />
        ) : (
          <VideoQuiz
            mediaId={media.id}
            videoTitle={media.title}
            videoDescription={media.description}
            onComplete={handleQuizComplete}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

