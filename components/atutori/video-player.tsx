"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipForward,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Loader2
} from "lucide-react"

interface VideoPlayerProps {
  mediaId: string
  title: string
  description: string | null
  url: string
  onComplete: () => void
  onStartQuiz: () => void
  onBack: () => void
}

export function VideoPlayer({
  mediaId,
  title,
  description,
  url,
  onComplete,
  onStartQuiz,
  onBack
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if URL is an embed URL (YouTube, Vimeo) or direct video
  const isEmbedUrl = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v")
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
    }
    if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop()
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  useEffect(() => {
    if (!isEmbedUrl && videoRef.current) {
      const video = videoRef.current

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime)
        setProgress((video.currentTime / video.duration) * 100)
        
        // Mark as complete when 90% watched
        if (video.currentTime / video.duration >= 0.9 && !isComplete) {
          setIsComplete(true)
          onComplete()
        }
      }

      const handleLoadedMetadata = () => {
        setDuration(video.duration)
        setIsLoading(false)
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setIsComplete(true)
        onComplete()
      }

      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("loadedmetadata", handleLoadedMetadata)
      video.addEventListener("ended", handleEnded)

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("ended", handleEnded)
      }
    }
  }, [isEmbedUrl, isComplete, onComplete])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newProgress = (clickX / rect.width) * 100
      const newTime = (newProgress / 100) * duration
      videoRef.current.currentTime = newTime
      setProgress(newProgress)
      setCurrentTime(newTime)
    }
  }

  return (
    <div className="space-y-4">
      {/* Back button and title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="font-bold text-xl">{title}</h2>
      </div>

      {/* Video container */}
      <Card className="overflow-hidden rounded-3xl border-2 border-primary/20">
        <div ref={containerRef} className="relative bg-black aspect-video">
          {isEmbedUrl ? (
            // Embedded video (YouTube, Vimeo)
            <iframe
              src={getEmbedUrl(url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            // Direct video file
            <>
              <video
                ref={videoRef}
                src={url}
                className="w-full h-full object-contain"
                onClick={togglePlay}
              />
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-12 w-12 animate-spin text-white" />
                </div>
              )}

              {/* Play/Pause overlay */}
              {!isPlaying && !isLoading && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                    <Play className="h-10 w-10 text-primary-foreground ml-1" />
                  </div>
                </button>
              )}

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress bar */}
                <div 
                  className="w-full h-2 bg-white/30 rounded-full cursor-pointer mb-3 group"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-primary rounded-full relative transition-all"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Description and Next button */}
      <Card className="rounded-3xl border-2 border-primary/20">
        <CardContent className="p-6">
          {description && (
            <p className="text-muted-foreground mb-4">{description}</p>
          )}

          {/* Progress indicator */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Watch Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            {isComplete && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Complete!</span>
              </div>
            )}
          </div>

          {/* Quiz button - always visible but with different states */}
          <Button
            onClick={onStartQuiz}
            size="lg"
            className="w-full rounded-2xl h-14 text-lg font-bold gap-2"
            disabled={!isEmbedUrl && progress < 50}
          >
            {isComplete ? (
              <>
                <Sparkles className="h-5 w-5" />
                Take the Quiz!
              </>
            ) : (
              <>
                <SkipForward className="h-5 w-5" />
                {isEmbedUrl ? "Ready for Quiz" : `Watch ${50 - Math.round(progress)}% more to unlock quiz`}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
