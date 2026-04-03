"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, CheckCircle, Sparkles, Film, Loader2 } from "lucide-react"

interface MediaItem {
  id: string
  title: string
  description: string | null
  url: string
  thumbnailUrl: string | null
  duration: number | null
  gradeGroup: string
  subjectId: string | null
  watched: boolean
  watchedAt: string | null
  quizCompleted: boolean
  quizScore: number | null
  assignedAt: string
}

interface MediaWindowProps {
  onSelectVideo: (media: MediaItem) => void
}

export function MediaWindow({ onSelectVideo }: MediaWindowProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMedia() {
      try {
        const response = await fetch("/api/media")
        if (!response.ok) throw new Error("Failed to fetch media")
        const data = await response.json()
        setMedia(data.media || [])
      } catch (err) {
        setError("Could not load your videos")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMedia()
  }, [])

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <Card className="bg-card border-2 border-primary/20 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Film className="h-5 w-5 text-primary" />
            My Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-2 border-primary/20 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Film className="h-5 w-5 text-primary" />
            My Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-2 border-primary/20 rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Film className="h-5 w-5 text-primary" />
          My Videos
          {media.length > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {media.filter(m => m.watched).length}/{media.length} watched
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Film className="h-8 w-8 text-primary/50" />
            </div>
            <p className="text-muted-foreground">No videos assigned yet</p>
            <p className="text-sm text-muted-foreground/70">
              Ask your tutor or parent to add some learning videos!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {media.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 p-3 rounded-2xl bg-background hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                onClick={() => onSelectVideo(item)}
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                      <Play className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  {item.watched && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(item.duration)}
                    </span>
                    {item.quizCompleted && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Sparkles className="h-3 w-3" />
                        Quiz: {item.quizScore}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Play button */}
                <Button
                  size="sm"
                  variant={item.watched ? "outline" : "default"}
                  className="rounded-full h-8 w-8 p-0 flex-shrink-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {media.length > 4 && (
              <Button variant="ghost" className="w-full rounded-xl text-primary">
                View all {media.length} videos
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
