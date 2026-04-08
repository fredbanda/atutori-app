// lib/actions/voice.ts
// Voice integration for Grades 1–3
// TTS: OpenAI tts-1 — speaks voiceScript, repeatAfterMe items, voiceExplanation
// STT: OpenAI Whisper — listens for child's echo, matches against listenFor array
// All functions are server actions — audio bytes returned as base64

"use server"

import OpenAI from "openai"

const openai = new OpenAI()

// ─────────────────────────────────────────────────────────────────
// VOICE SETTINGS
export type AudioClip = {
  text: string
  audio: string
  pauseAfterMs: number
}
// "nova" is warm and clear — best for young learners in testing
// "shimmer" is softer — good alternative for very young (Grade 1)
// Speed 0.85 gives children time to process without sounding robotic
// ─────────────────────────────────────────────────────────────────
const TTS_MODEL = "tts-1"
const TTS_VOICE: "nova" | "shimmer" | "alloy" | "echo" | "fable" | "onyx" = "nova"
const TTS_SPEED = 0.85 // slightly slower than normal — crucial for early learners

// ─────────────────────────────────────────────────────────────────
// SPEAK TEXT
// Converts any string to audio. Returns base64-encoded MP3.
// Used for: voiceScript, repeatAfterMe items, voiceExplanation
// ─────────────────────────────────────────────────────────────────
export async function speakText(
  text: string,
  speed: number = TTS_SPEED
): Promise<{ audio: string; durationHint: number }> {
  const response = await openai.audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE,
    input: text,
    speed,
    response_format: "mp3",
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  const audio = buffer.toString("base64")

  // Rough duration estimate: average 3 chars per spoken syllable at 0.85 speed
  // Good enough to decide how long to wait before showing the next UI element
  const durationHint = Math.ceil((text.length / 15) * (1 / speed) * 1000)

  return { audio, durationHint }
}

// ─────────────────────────────────────────────────────────────────
// SPEAK SEQUENCE
// Speaks each item in a repeatAfterMe array separately.
// Returns an array of base64 audio clips — one per item.
// The client plays clip[0], waits for child echo, plays clip[1], etc.
// ─────────────────────────────────────────────────────────────────
export async function speakSequence(
  items: string[],
  pauseAfterMs: number = 2000 // how long to wait for child to echo
): Promise<{ clips: { text: string; audio: string; pauseAfterMs: number }[] }> {
  const clips = await Promise.all(
    items.map(async (text) => {
      const { audio } = await speakText(text, 0.8) // even slower for echo sequences
      return { text, audio, pauseAfterMs }
    })
  )
  return { clips }
}

// ─────────────────────────────────────────────────────────────────
// PRELOAD LESSON AUDIO
// Call this when the lesson loads (not on demand) to eliminate
// all latency. Returns all audio for the lesson pre-generated.
// Pass the full lesson object from generateLesson().
// ─────────────────────────────────────────────────────────────────
export async function preloadLessonAudio(steps: any[]): Promise<{
  contentAudio: {
    stepIndex: number
    voiceScript: string | null
    voiceScriptAudio: string | null
    activityAudio: string | null
    repeatAfterMeClips: { text: string; audio: string; pauseAfterMs: number }[]
  }[]
  quizAudio: {
    stepIndex: number
    voicePrompt: string | null
    voicePromptAudio: string | null
    voiceExplanation: string | null
    voiceExplanationAudio: string | null
  }[]
}> {
  const contentAudio = []
  const quizAudio = []

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]

    if (step.type === "content") {
      // Phase 1: fall back to content text if voiceScript not present
      const scriptText = step.voiceScript ?? step.content ?? null
      const voiceScriptAudio = scriptText
        ? (await speakText(scriptText)).audio
        : null

      // Phase 1: fall back to activityPrompt spoken after content
      const activityAudio = step.activityPrompt
        ? (await speakText(step.activityPrompt, 0.8)).audio
        : null

      const repeatAfterMeClips =
        step.repeatAfterMe?.length > 0
          ? (await speakSequence(step.repeatAfterMe)).clips
          : []

      contentAudio.push({
        stepIndex: i,
        voiceScript: scriptText,
        voiceScriptAudio,
        activityAudio,
        repeatAfterMeClips,
      })
    }

    if (step.type === "quiz") {
      // Phase 1: fall back to question text if voicePrompt not present
      const promptText = step.voicePrompt ?? step.question ?? null
      const voicePromptAudio = promptText
        ? (await speakText(promptText)).audio
        : null

      const explanationText = step.voiceExplanation ?? step.explanation ?? null
      const voiceExplanationAudio = explanationText
        ? (await speakText(explanationText)).audio
        : null

      quizAudio.push({
        stepIndex: i,
        voicePrompt: promptText,
        voicePromptAudio,
        voiceExplanation: explanationText,
        voiceExplanationAudio,
      })
    }
  }

  return { contentAudio, quizAudio }
}

// ─────────────────────────────────────────────────────────────────
// TRANSCRIBE CHILD SPEECH
// Sends recorded audio to Whisper and returns what the child said.
// audioBase64: base64-encoded webm/mp3 from the browser MediaRecorder
// listenFor: array of accepted answers from the quiz step
// Returns: { transcript, matched, matchedAnswer }
// ─────────────────────────────────────────────────────────────────
export async function transcribeChildSpeech(
  audioBase64: string,
  listenFor: string[],
  contextHint?: string // optional hint to Whisper about what to expect
): Promise<{
  transcript: string
  matched: boolean
  matchedAnswer: string | null
  confidence: "high" | "low"
}> {
  // Convert base64 to buffer
  const audioBuffer = Buffer.from(audioBase64, "base64")

  // Whisper needs a File object — create one from the buffer
  const audioFile = new File([audioBuffer], "child-speech.webm", {
    type: "audio/webm",
  })

  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: audioFile,
    language: "en",
    // Prompt helps Whisper expect the right vocabulary — crucial for single words
    prompt: contextHint
      ? contextHint
      : `A young child is learning to read. They might say: ${listenFor.join(", ")}`,
  })

  const transcript = transcription.text.toLowerCase().trim()

  // Fuzzy match against listenFor — generous matching for young children
  // Strips punctuation and checks if any accepted answer appears in the transcript
  const normalise = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()

  const normalisedTranscript = normalise(transcript)
  let matchedAnswer: string | null = null

  for (const accepted of listenFor) {
    const normAccepted = normalise(accepted)
    if (
      normalisedTranscript === normAccepted ||
      normalisedTranscript.includes(normAccepted) ||
      normAccepted.includes(normalisedTranscript)
    ) {
      matchedAnswer = accepted
      break
    }
  }

  // Low confidence if transcript is very short (child may not have spoken clearly)
  const confidence: "high" | "low" =
    transcript.length > 0 && transcript !== "[inaudible]" ? "high" : "low"

  return {
    transcript,
    matched: matchedAnswer !== null,
    matchedAnswer,
    confidence,
  }
}

// ─────────────────────────────────────────────────────────────────
// SPEAK SOUND BUTTON
// Called when a child taps a soundButton.
// Speaks the phoneme sound, not the letter name.
// e.g. tapping "A" speaks "ah" not "ay"
// ─────────────────────────────────────────────────────────────────
export async function speakSoundButton(
  sound: string // the phonetic pronunciation from soundButtons[].sound
): Promise<{ audio: string }> {
  // Sound buttons use very slow speed — child needs to hear it clearly
  const { audio } = await speakText(sound, 0.75)
  return { audio }
}
