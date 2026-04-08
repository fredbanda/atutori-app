// hooks/use-voice-lesson.ts
// Manages all voice interactions for a lesson step.
// Plays TTS audio, drives the echo sequence, records child speech via MediaRecorder.
// Designed to work WITH or WITHOUT microphone permission — graceful fallback.

"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { transcribeChildSpeech, speakSoundButton } from "@/lib/actions/voice"
import type { AudioClip } from "@/lib/actions/voice"

type EchoState =
  | "idle"
  | "playing"        // TTS is speaking
  | "listening"      // waiting for child to echo
  | "recording"      // actively recording child's voice
  | "matched"        // child said the right thing
  | "retry"          // child said something unexpected — try again

export type VoiceLessonState = {
  echoState: EchoState
  currentClipIndex: number
  totalClips: number
  transcript: string
  micAvailable: boolean
  isPlaying: boolean
}

// ─────────────────────────────────────────────────────────────────
// Helper — play base64 audio and resolve when finished
// ─────────────────────────────────────────────────────────────────
function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`)
    audio.onended = () => resolve()
    audio.onerror = () => resolve() // never block on audio error
    audio.play().catch(() => resolve())
  })
}

// ─────────────────────────────────────────────────────────────────
// Helper — record audio for a duration, return base64
// ─────────────────────────────────────────────────────────────────
async function recordAudio(durationMs: number): Promise<string | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    const chunks: Blob[] = []

    recorder.ondataavailable = (e) => chunks.push(e.data)

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: "audio/webm" })
        const buffer = await blob.arrayBuffer()
        const base64 = Buffer.from(buffer).toString("base64")
        resolve(base64)
      }

      recorder.start()
      setTimeout(() => recorder.stop(), durationMs)
    })
  } catch {
    return null // mic permission denied or unavailable
  }
}

// ─────────────────────────────────────────────────────────────────
// MAIN HOOK
// ─────────────────────────────────────────────────────────────────
export function useVoiceLesson() {
  const [state, setState] = useState<VoiceLessonState>({
    echoState: "idle",
    currentClipIndex: 0,
    totalClips: 0,
    transcript: "",
    micAvailable: false,
    isPlaying: false,
  })

  const abortRef = useRef(false)

  // Check mic availability on mount
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop())
        setState((s) => ({ ...s, micAvailable: true }))
      })
      .catch(() => {
        setState((s) => ({ ...s, micAvailable: false }))
      })
  }, [])

  // ── Play the voiceScript for a content step ────────────────────
  const playVoiceScript = useCallback(async (audio: string) => {
    setState((s) => ({ ...s, isPlaying: true, echoState: "playing" }))
    await playBase64Audio(audio)
    setState((s) => ({ ...s, isPlaying: false, echoState: "idle" }))
  }, [])

  // ── Run the full echo sequence ─────────────────────────────────
  // TTS says each clip → waits → child echoes (records if mic available)
  // → Whisper matches → moves to next clip
  const runEchoSequence = useCallback(
    async (
      clips: AudioClip[],
      listenFor: string[][],   // one listenFor array per clip
      onComplete: () => void
    ) => {
      abortRef.current = false

      setState((s) => ({
        ...s,
        totalClips: clips.length,
        currentClipIndex: 0,
        echoState: "idle",
      }))

      for (let i = 0; i < clips.length; i++) {
        if (abortRef.current) break

        const clip = clips[i]
        const accepted = listenFor[i] ?? [clip.text]

        // 1. Play the TTS clip
        setState((s) => ({ ...s, currentClipIndex: i, echoState: "playing" }))
        await playBase64Audio(clip.audio)

        if (abortRef.current) break

        // 2. Pause — child listens / prepares to echo
        setState((s) => ({ ...s, echoState: "listening" }))
        await new Promise((r) => setTimeout(r, 400))

        if (abortRef.current) break

        // 3. Record child's echo (if mic available)
        if (state.micAvailable) {
          setState((s) => ({ ...s, echoState: "recording" }))
          const recordedAudio = await recordAudio(clip.pauseAfterMs)

          if (recordedAudio && !abortRef.current) {
            const result = await transcribeChildSpeech(
              recordedAudio,
              accepted,
              `Child echoing: "${clip.text}"`
            )

            setState((s) => ({
              ...s,
              transcript: result.transcript,
              echoState: result.matched ? "matched" : "retry",
            }))

            // Brief celebration pause on match
            await new Promise((r) =>
              setTimeout(r, result.matched ? 800 : 1200)
            )
          }
        } else {
          // No mic — just pause for the child to say it without recording
          await new Promise((r) => setTimeout(r, clip.pauseAfterMs))
        }
      }

      if (!abortRef.current) {
        setState((s) => ({ ...s, echoState: "idle" }))
        onComplete()
      }
    },
    [state.micAvailable]
  )

  // ── Play a sound button on tap ─────────────────────────────────
  const playSoundButton = useCallback(async (sound: string) => {
    setState((s) => ({ ...s, isPlaying: true }))
    const { audio } = await speakSoundButton(sound)
    await playBase64Audio(audio)
    setState((s) => ({ ...s, isPlaying: false }))
  }, [])

  // ── Play quiz voice prompt ─────────────────────────────────────
  const playQuizPrompt = useCallback(async (audio: string) => {
    setState((s) => ({ ...s, isPlaying: true }))
    await playBase64Audio(audio)
    setState((s) => ({ ...s, isPlaying: false }))
  }, [])

  // ── Play explanation after answering ──────────────────────────
  const playExplanation = useCallback(async (audio: string) => {
    setState((s) => ({ ...s, isPlaying: true }))
    await playBase64Audio(audio)
    setState((s) => ({ ...s, isPlaying: false }))
  }, [])

  // ── Stop everything ────────────────────────────────────────────
  const stop = useCallback(() => {
    abortRef.current = true
    setState((s) => ({ ...s, echoState: "idle", isPlaying: false }))
  }, [])

  return {
    state,
    playVoiceScript,
    runEchoSequence,
    playSoundButton,
    playQuizPrompt,
    playExplanation,
    stop,
  }
}
