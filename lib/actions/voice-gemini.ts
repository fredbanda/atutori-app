// lib/actions/voice-gemini.ts
// Voice integration using Google Cloud TTS + Gemini AI for Grades 1–3
// TTS: Google Cloud Text-to-Speech — speaks voiceScript, repeatAfterMe items
// STT: Google Cloud Speech-to-Text — listens for child's echo
// AI: Gemini for enhancing voice content and making it more engaging
// All functions are server actions — audio bytes returned as base64

"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// ─────────────────────────────────────────────────────────────────
// VOICE SETTINGS
export type AudioClip = {
  text: string;
  audio: string;
  pauseAfterMs: number;
};

// Google Cloud TTS settings optimized for young learners
const TTS_VOICE = "en-US-Journey-D"; // Warm, child-friendly voice
const TTS_SPEED = 0.9; // Slightly slower for comprehension

// ─────────────────────────────────────────────────────────────────
// ENHANCE TEXT WITH GEMINI BEFORE TTS
// Makes text more engaging and child-friendly using Gemini AI
// ─────────────────────────────────────────────────────────────────
async function enhanceTextForChild(
  text: string,
  childAge: number = 6,
  emotion: "excited" | "calm" | "encouraging" = "excited"
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Transform this educational text to be perfect for a ${childAge}-year-old child.
Make it ${emotion}, engaging, and use simple words.
Keep the same meaning but make it more conversational and fun.
Add appropriate pauses with commas where a teacher would pause.
Text: "${text}"

Return only the enhanced text, nothing else.`;

    const result = await model.generateContent(prompt);
    const enhancedText = result.response.text().trim();

    return enhancedText || text; // Fallback to original if enhancement fails
  } catch (error) {
    console.error("Gemini text enhancement error:", error);
    return text; // Return original text if Gemini fails
  }
}

// ─────────────────────────────────────────────────────────────────
// SPEAK TEXT USING GOOGLE CLOUD TTS (Enhanced by Gemini)
// Converts any string to audio using Google Cloud TTS
// ─────────────────────────────────────────────────────────────────
export async function speakText(
  text: string,
  speed: number = TTS_SPEED
): Promise<{ audio: string; durationHint: number }> {
  try {
    // First, enhance the text with Gemini AI
    const enhancedText = await enhanceTextForChild(text, 6, "excited");

    // Then convert to speech with Google Cloud TTS
    const response = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`,
          "Content-Type": "application/json",
          "X-Goog-User-Project": process.env.GOOGLE_CLOUD_PROJECT_ID,
        },
        body: JSON.stringify({
          input: { text: enhancedText },
          voice: {
            languageCode: "en-US",
            name: TTS_VOICE,
            ssmlGender: "NEUTRAL",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: speed,
            pitch: 0.2, // Slightly higher pitch for children
            volumeGainDb: 1.0,
            sampleRateHertz: 24000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    const data = await response.json();
    const audio = data.audioContent; // Already base64 encoded

    // Duration estimate
    const durationHint = Math.ceil(
      (enhancedText.length / 12) * (1 / speed) * 1000
    );

    return { audio, durationHint };
  } catch (error) {
    console.error("Gemini-enhanced TTS error:", error);
    // Fallback to simple TTS without enhancement
    return await simpleTTS(text, speed);
  }
}

// ─────────────────────────────────────────────────────────────────
// SIMPLE TTS FALLBACK (No Gemini enhancement)
// ─────────────────────────────────────────────────────────────────
async function simpleTTS(
  text: string,
  speed: number
): Promise<{ audio: string; durationHint: number }> {
  // If Google Cloud TTS fails, we can still try a simple approach
  // For now, return empty audio as fallback
  console.log("Falling back to simple TTS for:", text);
  return {
    audio: "",
    durationHint: Math.ceil(text.length * 50), // Rough estimate
  };
}

// ─────────────────────────────────────────────────────────────────
// ENHANCED GEMINI TTS FOR CHILDREN
// Special voices and adjustments for young learners
// ─────────────────────────────────────────────────────────────────
export async function speakTextForChild(
  text: string,
  childAge: number = 6,
  emotion: "excited" | "calm" | "encouraging" = "excited"
): Promise<{ audio: string; durationHint: number }> {
  // Adjust voice parameters based on child age and emotion
  let voiceName = TTS_VOICE;
  let pitch = 0.2;
  let speed = TTS_SPEED;

  switch (emotion) {
    case "excited":
      pitch = 0.4;
      speed = 1.0;
      break;
    case "calm":
      pitch = 0.1;
      speed = 0.8;
      break;
    case "encouraging":
      pitch = 0.3;
      speed = 0.85;
      break;
  }

  // Younger children need slower, higher pitched voices
  if (childAge <= 6) {
    speed *= 0.9;
    pitch += 0.1;
  }

  try {
    const response = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "en-US",
            name: voiceName,
            ssmlGender: "NEUTRAL",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: speed,
            pitch: pitch,
            volumeGainDb: 2.0, // Slightly louder for children
            sampleRateHertz: TTS_SAMPLE_RATE,
          },
        }),
      }
    );

    const data = await response.json();
    const durationHint = Math.ceil((text.length / 12) * (1 / speed) * 1000);

    return {
      audio: data.audioContent,
      durationHint,
    };
  } catch (error) {
    console.error("Enhanced Gemini TTS error:", error);
    return speakText(text, speed); // Fallback to basic TTS
  }
}

// ─────────────────────────────────────────────────────────────────
// TRANSCRIBE CHILD SPEECH USING GEMINI STT
// Converts audio to text for voice interaction
// ─────────────────────────────────────────────────────────────────
export async function transcribeChildSpeech(
  audioBlob: ArrayBuffer
): Promise<string> {
  try {
    // Convert ArrayBuffer to base64
    const base64Audio = Buffer.from(audioBlob).toString("base64");

    // Use Google Speech-to-Text API
    const response = await fetch(
      "https://speech.googleapis.com/v1/speech:recognize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 16000,
            languageCode: "en-US",
            enableAutomaticPunctuation: false,
            model: "latest_short", // Optimized for short phrases
            useEnhanced: true,
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].alternatives[0].transcript.toLowerCase().trim();
    }

    return "";
  } catch (error) {
    console.error("Speech recognition error:", error);
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────
// PRELOAD LESSON AUDIO USING GEMINI TTS
// Generates all audio for a lesson using Gemini
// ─────────────────────────────────────────────────────────────────
export async function preloadLessonAudioGemini(steps: any[]) {
  const contentAudio: any[] = [];
  const quizAudio: any[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (step.type === "content") {
      const audio: any = { stepIndex: i };

      // Voice script (main content)
      if (step.voiceScript) {
        const result = await speakTextForChild(step.voiceScript, 6, "excited");
        audio.voiceScriptAudio = result.audio;
      }

      // Activity prompt
      if (step.activityPrompt) {
        const result = await speakTextForChild(
          step.activityPrompt,
          6,
          "encouraging"
        );
        audio.activityAudio = result.audio;
      }

      // Repeat after me clips
      if (step.repeatAfterMe?.length > 0) {
        audio.repeatAfterMeClips = [];
        for (const item of step.repeatAfterMe) {
          const result = await speakTextForChild(item, 6, "calm");
          audio.repeatAfterMeClips.push({
            text: item,
            audio: result.audio,
          });
        }
      }

      contentAudio.push(audio);
    } else if (step.type === "quiz") {
      const audio: any = { stepIndex: i };

      // Voice prompt for quiz
      if (step.voiceExplanation) {
        const result = await speakTextForChild(
          step.voiceExplanation,
          6,
          "encouraging"
        );
        audio.voicePromptAudio = result.audio;
      }

      quizAudio.push(audio);
    }
  }

  return { contentAudio, quizAudio };
}
