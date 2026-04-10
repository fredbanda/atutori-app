// lib/actions/voice-production.ts
// Production-ready voice system for massive scale
// Bulletproof infrastructure with monitoring and intelligent failover

"use server";

import {
  bulletproofTTS,
  bulletproofEnhancement,
  bulletproofBatchTTS,
} from "@/lib/services/bulletproof-voice";
import { monitorVoiceOperation } from "@/lib/monitoring/voice-health";
import OpenAI from "openai";

const openai = new OpenAI();

// ─────────────────────────────────────────────────────────────────
// PRODUCTION VOICE TYPES
// ─────────────────────────────────────────────────────────────────
export type AudioClip = {
  text: string;
  audio: string;
  pauseAfterMs: number;
};

export type VoiceResult = {
  audio: string;
  provider?: string;
  fromCache?: boolean;
  durationHint?: number;
  fallbackText?: string;
  useBrowserTTS?: boolean;
};

// ─────────────────────────────────────────────────────────────────
// BULLETPROOF TTS - PRODUCTION READY
// Handles failures, rate limiting, and intelligent provider selection
// ─────────────────────────────────────────────────────────────────
export async function speakText(
  text: string,
  speed: number = 0.85,
  userGrade?: number
): Promise<VoiceResult> {
  try {
    // Use bulletproof TTS with enhanced monitoring
    const result = await bulletproofTTS(text, userGrade);

    // Handle browser TTS fallback
    if (result.audio.startsWith("browser_tts:")) {
      return {
        audio: "",
        provider: result.provider,
        fromCache: result.fromCache,
        durationHint: Math.round(text.length * 0.08),
        fallbackText: text.replace("browser_tts:", ""),
        useBrowserTTS: true,
      };
    }

    return {
      audio: result.audio,
      provider: result.provider,
      fromCache: result.fromCache,
      durationHint: Math.round(text.length * 0.08),
    };
  } catch (error) {
    console.error("Production TTS completely failed:", error);

    // Ultimate fallback - browser TTS
    return {
      audio: "",
      provider: "browser_fallback",
      fromCache: false,
      durationHint: Math.round(text.length * 0.08),
      fallbackText: text,
      useBrowserTTS: true,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// ENHANCED TEXT FOR EDUCATION
// ─────────────────────────────────────────────────────────────────
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
    return text;
  }
}

// ─────────────────────────────────────────────────────────────────
// SPEECH-TO-TEXT WITH WHISPER - BULLETPROOF
// ─────────────────────────────────────────────────────────────────
export async function transcribeChildSpeech(
  audioBase64: string,
  expectedWords?: string[],
  userGrade?: number
): Promise<{
  transcription: string;
  confidence: number;
  matchFound: boolean;
  matchedWord?: string;
}> {
  return await monitorVoiceOperation(
    "openai",
    "stt",
    async () => {
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioBase64, "base64");

      // Create a File-like object for Whisper
      const audioFile = new File([audioBuffer], "audio.wav", {
        type: "audio/wav",
      });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
        response_format: "verbose_json",
      });

      const text = transcription.text.toLowerCase().trim();

      // Check if transcription matches expected words
      let matchFound = false;
      let matchedWord: string | undefined;
      let confidence = 0.7; // Default confidence

      if (expectedWords && expectedWords.length > 0) {
        for (const expectedWord of expectedWords) {
          const normalizedExpected = expectedWord.toLowerCase().trim();

          if (
            text.includes(normalizedExpected) ||
            normalizedExpected.includes(text) ||
            levenshteinDistance(text, normalizedExpected) <= 2
          ) {
            matchFound = true;
            matchedWord = expectedWord;
            confidence = 0.9;
            break;
          }
        }
      }

      return {
        transcription: transcription.text,
        confidence,
        matchFound,
        matchedWord,
      };
    },
    userGrade
  );
}

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// ─────────────────────────────────────────────────────────────────
// REPEAT AFTER ME SEQUENCES - PRODUCTION READY
// ─────────────────────────────────────────────────────────────────
export async function speakSequence(
  sequence: string[]
): Promise<{ clips: AudioClip[] }> {
  try {
    // Prepare batch TTS items
    const ttsItems = sequence.map((text, index) => ({
      text,
      id: `clip_${index}`,
    }));

    // Use bulletproof batch processing
    const results = await bulletproofBatchTTS(ttsItems, 6); // Assuming grade 1-3 context

    // Convert to AudioClip format
    const clips: AudioClip[] = results.map((result, index) => ({
      text: sequence[index],
      audio: result.audio.startsWith("browser_tts:")
        ? result.audio.replace("browser_tts:", "")
        : result.audio,
      pauseAfterMs: 1500, // Standard pause for child echo
    }));

    return { clips };
  } catch (error) {
    console.error("Sequence TTS failed:", error);

    // Fallback to individual TTS calls
    const clips: AudioClip[] = [];

    for (const text of sequence) {
      try {
        const result = await speakText(text);
        clips.push({
          text,
          audio: result.audio || `browser_tts:${text}`,
          pauseAfterMs: 1500,
        });
      } catch {
        // Ultimate fallback
        clips.push({
          text,
          audio: `browser_tts:${text}`,
          pauseAfterMs: 1500,
        });
      }
    }

    return { clips };
  }
}

// ─────────────────────────────────────────────────────────────────
// PRELOAD LESSON AUDIO - PRODUCTION OPTIMIZED
// Handles massive scale with batch processing and intelligent caching
// ─────────────────────────────────────────────────────────────────
export async function preloadLessonAudio(
  steps: any[],
  onProgress?: (completed: number, total: number) => void
): Promise<{
  contentAudio: {
    stepIndex: number;
    voiceScript: string | null;
    voiceScriptAudio: string | null;
    activityAudio: string | null;
    repeatAfterMeClips: AudioClip[];
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

  // Collect all TTS items for batch processing
  const allTTSItems: Array<{
    text: string;
    id: string;
    stepIndex: number;
    type: string;
  }> = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (step.type === "content") {
      const scriptText = step.voiceScript ?? step.content ?? null;
      if (scriptText) {
        allTTSItems.push({
          text: scriptText,
          id: `content_${i}_script`,
          stepIndex: i,
          type: "script",
        });
      }

      if (step.activityPrompt) {
        allTTSItems.push({
          text: step.activityPrompt,
          id: `content_${i}_activity`,
          stepIndex: i,
          type: "activity",
        });
      }

      if (step.repeatAfterMe?.length > 0) {
        step.repeatAfterMe.forEach((text: string, index: number) => {
          allTTSItems.push({
            text,
            id: `content_${i}_repeat_${index}`,
            stepIndex: i,
            type: `repeat_${index}`,
          });
        });
      }
    }

    if (step.type === "quiz") {
      const promptText = step.voicePrompt ?? step.question ?? null;
      if (promptText) {
        allTTSItems.push({
          text: promptText,
          id: `quiz_${i}_prompt`,
          stepIndex: i,
          type: "prompt",
        });
      }

      const explanationText = step.voiceExplanation ?? step.explanation ?? null;
      if (explanationText) {
        allTTSItems.push({
          text: explanationText,
          id: `quiz_${i}_explanation`,
          stepIndex: i,
          type: "explanation",
        });
      }
    }
  }

  // Process all TTS in batches
  const ttsResults = await bulletproofBatchTTS(
    allTTSItems.map((item) => ({ text: item.text, id: item.id })),
    6, // Grade level
    onProgress
  );

  // Create lookup map for results
  const resultMap = new Map(
    ttsResults.map((result) => [result.id, result.audio])
  );

  // Build content and quiz audio structures
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (step.type === "content") {
      const scriptText = step.voiceScript ?? step.content ?? null;
      const voiceScriptAudio = scriptText
        ? resultMap.get(`content_${i}_script`) ?? null
        : null;
      const activityAudio = step.activityPrompt
        ? resultMap.get(`content_${i}_activity`) ?? null
        : null;

      const repeatAfterMeClips: AudioClip[] = [];
      if (step.repeatAfterMe?.length > 0) {
        step.repeatAfterMe.forEach((text: string, index: number) => {
          const audio = resultMap.get(`content_${i}_repeat_${index}`);
          if (audio) {
            repeatAfterMeClips.push({
              text,
              audio: audio.startsWith("browser_tts:")
                ? audio.replace("browser_tts:", "")
                : audio,
              pauseAfterMs: 1500,
            });
          }
        });
      }

      contentAudio.push({
        stepIndex: i,
        voiceScript: scriptText,
        voiceScriptAudio,
        activityAudio,
        repeatAfterMeClips,
      });
    }

    if (step.type === "quiz") {
      const promptText = step.voicePrompt ?? step.question ?? null;
      const voicePromptAudio = promptText
        ? resultMap.get(`quiz_${i}_prompt`) ?? null
        : null;

      const explanationText = step.voiceExplanation ?? step.explanation ?? null;
      const voiceExplanationAudio = explanationText
        ? resultMap.get(`quiz_${i}_explanation`) ?? null
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
// PRODUCTION UTILITIES
// ─────────────────────────────────────────────────────────────────

// Check if browser TTS is needed
export function needsBrowserTTS(audioData: string): {
  needed: boolean;
  text?: string;
} {
  if (audioData.startsWith("browser_tts:")) {
    return { needed: true, text: audioData.replace("browser_tts:", "") };
  }
  return { needed: false };
}

// Validate audio format for production
export function validateAudioData(audioData: string): boolean {
  if (!audioData) return false;
  if (audioData.startsWith("browser_tts:")) return true; // Browser TTS instruction

  try {
    // Check if valid base64
    const decoded = Buffer.from(audioData, "base64");
    return decoded.length > 0;
  } catch {
    return false;
  }
}
