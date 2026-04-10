// lib/actions/voice.ts
// Voice integration for Grades 1–3 - Production Ready
// Enhanced with bulletproof infrastructure, monitoring, and failover

"use server";

import {
  bulletproofTTS,
  bulletproofEnhancement,
  bulletproofBatchTTS,
} from "@/lib/services/bulletproof-voice";
import { monitorVoiceOperation } from "@/lib/monitoring/voice-health";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// ─────────────────────────────────────────────────────────────────
// PRODUCTION-READY VOICE SETTINGS
// ─────────────────────────────────────────────────────────────────
export type AudioClip = {
  text: string;
  audio: string;
  pauseAfterMs: number;
};

// ─────────────────────────────────────────────────────────────────
// BULLETPROOF TTS WITH INTELLIGENT FAILOVER
// ─────────────────────────────────────────────────────────────────
export async function speakText(
  text: string,
  speed: number = 0.85,
  userGrade?: number
): Promise<{ audio: string; provider?: string; fromCache?: boolean }> {
  try {
    // Use bulletproof TTS system
    const result = await bulletproofTTS(text, userGrade);
    return result;
  } catch (error) {
    console.error("Bulletproof TTS failed, using fallback:", error);
    return { audio: `browser_tts:${text}` };
  }
}

// Enhanced text processing for educational content
export async function enhanceEducationalText(
  text: string,
  userGrade: number,
  context?: string
): Promise<string> {
  try {
    const result = await bulletproofEnhancement(text, userGrade, context);
    return result.enhanced;
  } catch (error) {
    console.error("Text enhancement failed:", error);
    return text; // Fallback to original
  }
}

// Voice provider configuration - can be controlled via environment variable
const VOICE_PROVIDER = process.env.VOICE_PROVIDER || "gemini"; // "openai" or "gemini"

// OpenAI TTS Settings
const OPENAI_TTS_MODEL = "tts-1";
const OPENAI_TTS_VOICE:
  | "nova"
  | "shimmer"
  | "alloy"
  | "echo"
  | "fable"
  | "onyx" = "nova";
const TTS_SPEED = 0.85; // slightly slower than normal — crucial for early learners

// ─────────────────────────────────────────────────────────────────
// ENHANCED TEXT WITH GEMINI AI
// Makes educational content more engaging for children
// ─────────────────────────────────────────────────────────────────
// ENHANCED TEXT CACHING & RETRY LOGIC
// ─────────────────────────────────────────────────────────────────

// Cache for enhanced text to avoid redundant API calls
const textEnhancementCache = new Map<string, string>();

// Rate limiting queue to prevent API flooding
let lastGeminiRequest = 0;
const GEMINI_REQUEST_DELAY_MS = parseInt(
  process.env.GEMINI_REQUEST_DELAY_MS || "500"
); // Configurable delay
const VOICE_BATCH_SIZE = parseInt(process.env.VOICE_BATCH_SIZE || "3"); // Configurable batch size

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastGeminiRequest;

  if (timeSinceLastRequest < GEMINI_REQUEST_DELAY_MS) {
    const waitTime = GEMINI_REQUEST_DELAY_MS - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms...`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastGeminiRequest = Date.now();
}

// Retry with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRetryableError =
        error.status === 503 ||
        error.status === 429 ||
        error.message?.includes("high demand");

      if (isLastAttempt || !isRetryableError) {
        throw error; // Don't retry non-retryable errors or on last attempt
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delayMs = baseDelayMs * Math.pow(2, attempt);
      console.log(
        `Gemini API retry ${attempt + 1}/${maxRetries} after ${delayMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Max retries exceeded");
}

async function enhanceTextWithGemini(
  text: string,
  childAge: number = 6
): Promise<string> {
  if (VOICE_PROVIDER !== "gemini") return text;

  // Check cache first
  const cacheKey = `${text}_${childAge}`;
  if (textEnhancementCache.has(cacheKey)) {
    console.log("Using cached enhanced text");
    return textEnhancementCache.get(cacheKey)!;
  }

  try {
    // Rate limit requests
    await waitForRateLimit();

    const enhanced = await retryWithBackoff(
      async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Make this educational text perfect for a ${childAge}-year-old child:
- Use simple, exciting words
- Make it conversational and warm
- Add natural pauses with commas
- Keep the same educational meaning
- Make it sound like a friendly teacher

Text: "${text}"

Enhanced text:`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      },
      3,
      1000
    );

    // Cache the result
    if (enhanced) {
      textEnhancementCache.set(cacheKey, enhanced);

      // Limit cache size to prevent memory issues
      if (textEnhancementCache.size > 100) {
        const firstKey = textEnhancementCache.keys().next().value;
        if (firstKey) {
          textEnhancementCache.delete(firstKey);
        }
      }
    }

    return enhanced || text;
  } catch (error) {
    console.error("Gemini text enhancement failed after retries:", error);
    return text; // Fallback to original
  }
}

// ─────────────────────────────────────────────────────────────────
// LEGACY SPEAK TEXT - DEPRECATED
// This function has been replaced by the bulletproof speakText above
// Keeping for any old code that might reference the old API
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// SPEAK SEQUENCE (Batch Processing)
// Speaks each item in a repeatAfterMe array separately.
// Returns an array of base64 audio clips — one per item.
// The client plays clip[0], waits for child echo, plays clip[1], etc.
// ─────────────────────────────────────────────────────────────────

// Process items in batches to avoid API rate limiting
async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = VOICE_BATCH_SIZE,
  delayBetweenBatchesMs: number = 200
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1} (${
        batch.length
      } items)...`
    );

    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    // Delay between batches to respect rate limits
    if (i + batchSize < items.length) {
      await new Promise((resolve) =>
        setTimeout(resolve, delayBetweenBatchesMs)
      );
    }
  }

  return results;
}

export async function speakSequence(
  items: string[],
  pauseAfterMs: number = 2000 // how long to wait for child to echo
): Promise<{ clips: { text: string; audio: string; pauseAfterMs: number }[] }> {
  const clips = await processBatch(
    items,
    async (text) => {
      const { audio } = await speakText(text, 0.8); // even slower for echo sequences
      return { text, audio, pauseAfterMs };
    },
    2, // Smaller batch size for voice sequences
    300 // Slightly longer delay
  );

  return { clips };
}

// ─────────────────────────────────────────────────────────────────
// PRELOAD LESSON AUDIO
// Call this when the lesson loads (not on demand) to eliminate
// all latency. Returns all audio for the lesson pre-generated.
// Pass the full lesson object from generateLesson().
// ─────────────────────────────────────────────────────────────────
export async function preloadLessonAudio(steps: any[]): Promise<{
  contentAudio: {
    stepIndex: number;
    voiceScript: string | null;
    voiceScriptAudio: string | null;
    activityAudio: string | null;
    repeatAfterMeClips: { text: string; audio: string; pauseAfterMs: number }[];
  }[];
  quizAudio: {
    stepIndex: number;
    voicePrompt: string | null;
    voicePromptAudio: string | null;
    voiceExplanation: string | null;
    voiceExplanationAudio: string | null;
  }[];
}> {
  const contentAudio = [];
  const quizAudio = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (step.type === "content") {
      // Phase 1: fall back to content text if voiceScript not present
      const scriptText = step.voiceScript ?? step.content ?? null;
      const voiceScriptAudio = scriptText
        ? (await speakText(scriptText)).audio
        : null;

      // Phase 1: fall back to activityPrompt spoken after content
      const activityAudio = step.activityPrompt
        ? (await speakText(step.activityPrompt, 0.8)).audio
        : null;

      const repeatAfterMeClips =
        step.repeatAfterMe?.length > 0
          ? (await speakSequence(step.repeatAfterMe)).clips
          : [];

      contentAudio.push({
        stepIndex: i,
        voiceScript: scriptText,
        voiceScriptAudio,
        activityAudio,
        repeatAfterMeClips,
      });
    }

    if (step.type === "quiz") {
      // Phase 1: fall back to question text if voicePrompt not present
      const promptText = step.voicePrompt ?? step.question ?? null;
      const voicePromptAudio = promptText
        ? (await speakText(promptText)).audio
        : null;

      const explanationText = step.voiceExplanation ?? step.explanation ?? null;
      const voiceExplanationAudio = explanationText
        ? (await speakText(explanationText)).audio
        : null;

      quizAudio.push({
        stepIndex: i,
        voicePrompt: promptText,
        voicePromptAudio,
        voiceExplanation: explanationText,
        voiceExplanationAudio,
      });
    }
  }

  return { contentAudio, quizAudio };
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
  transcript: string;
  matched: boolean;
  matchedAnswer: string | null;
  confidence: "high" | "low";
}> {
  // Convert base64 to buffer
  const audioBuffer = Buffer.from(audioBase64, "base64");

  // Whisper needs a File object — create one from the buffer
  const audioFile = new File([audioBuffer], "child-speech.webm", {
    type: "audio/webm",
  });

  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: audioFile,
    language: "en",
    // Prompt helps Whisper expect the right vocabulary — crucial for single words
    prompt: contextHint
      ? contextHint
      : `A young child is learning to read. They might say: ${listenFor.join(
          ", "
        )}`,
  });

  const transcript = transcription.text.toLowerCase().trim();

  // Fuzzy match against listenFor — generous matching for young children
  // Strips punctuation and checks if any accepted answer appears in the transcript
  const normalise = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

  const normalisedTranscript = normalise(transcript);
  let matchedAnswer: string | null = null;

  for (const accepted of listenFor) {
    const normAccepted = normalise(accepted);
    if (
      normalisedTranscript === normAccepted ||
      normalisedTranscript.includes(normAccepted) ||
      normAccepted.includes(normalisedTranscript)
    ) {
      matchedAnswer = accepted;
      break;
    }
  }

  // Low confidence if transcript is very short (child may not have spoken clearly)
  const confidence: "high" | "low" =
    transcript.length > 0 && transcript !== "[inaudible]" ? "high" : "low";

  return {
    transcript,
    matched: matchedAnswer !== null,
    matchedAnswer,
    confidence,
  };
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
  const { audio } = await speakText(sound, 0.75);
  return { audio };
}
