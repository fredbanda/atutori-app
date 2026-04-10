"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface VoicePlayerProps {
  text: string;
  speed?: number;
  onStart?: () => void;
  onEnd?: () => void;
  children: (params: {
    isPlaying: boolean;
    speak: () => Promise<void>;
    stop: () => void;
  }) => React.ReactNode;
}

interface TTSResponse {
  audio: string;
  durationHint: number;
  fallbackText?: string;
  useBrowserTTS?: boolean;
}

export function VoicePlayer({
  text,
  speed = 0.85,
  onStart,
  onEnd,
  children,
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopCurrentPlayback = useCallback(() => {
    // Stop server-side audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop browser TTS
    if (speechRef.current) {
      speechSynthesis.cancel();
      speechRef.current = null;
    }

    setIsPlaying(false);
    onEnd?.();
  }, [onEnd]);

  const speak = useCallback(async () => {
    if (isPlaying) {
      stopCurrentPlayback();
      return;
    }

    setIsPlaying(true);
    onStart?.();

    try {
      // Try server-side TTS first
      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speed }),
      });

      const data: TTSResponse = await response.json();

      if (data.audio && !data.useBrowserTTS) {
        // Use server-generated audio
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          onEnd?.();
        };

        audio.onerror = () => {
          console.error("Audio playback error, falling back to browser TTS");
          playWithBrowserTTS(data.fallbackText || text);
        };

        await audio.play();
      } else {
        // Use browser TTS (either by design or as fallback)
        playWithBrowserTTS(data.fallbackText || text);
      }
    } catch (error) {
      console.error("Server TTS failed, using browser TTS:", error);
      playWithBrowserTTS(text);
    }
  }, [text, speed, isPlaying, onStart, onEnd, stopCurrentPlayback]);

  const playWithBrowserTTS = useCallback(
    (textToSpeak: string) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = speed;
        utterance.pitch = 1.1; // Slightly higher pitch for children
        utterance.volume = 0.9;

        // Try to find a child-friendly voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (voice) =>
            voice.name.includes("Female") ||
            voice.name.includes("Google UK English Female") ||
            voice.name.includes("Microsoft Zira") ||
            voice.lang.startsWith("en-")
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          setIsPlaying(false);
          onEnd?.();
        };

        utterance.onerror = (error) => {
          console.error("Browser TTS error:", error);
          setIsPlaying(false);
          onEnd?.();
        };

        speechRef.current = utterance;
        speechSynthesis.speak(utterance);
      } else {
        console.error("Speech synthesis not supported");
        setIsPlaying(false);
        onEnd?.();
      }
    },
    [speed, onEnd]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentPlayback();
    };
  }, [stopCurrentPlayback]);

  return <>{children({ isPlaying, speak, stop: stopCurrentPlayback })}</>;
}
