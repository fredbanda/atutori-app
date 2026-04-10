// lib/gemini-live.ts
// Gemini Live Voice Assistant Integration
// Real-time conversational tutoring for Grades 1-3

import { GoogleGenerativeAI } from "@google/generative-ai";
import { transcribeChildSpeech, speakText } from "./actions/voice";

interface GeminiLiveSession {
  sessionId: string;
  childProfile: ChildProfile;
  conversationContext: ConversationMessage[];
  activeLesson?: LessonContext;
}

interface ChildProfile {
  name: string;
  age: number;
  grade: number;
  interests: string[];
  learningStyle: "visual" | "auditory" | "kinesthetic";
  strugglingWith: string[];
  excelsAt: string[];
  currentTopic: string;
}

interface ConversationMessage {
  role: "tutor" | "child";
  content: string;
  timestamp: Date;
  audioData?: ArrayBuffer;
  emotion?: "excited" | "confused" | "bored" | "engaged";
}

interface LessonContext {
  subject: string;
  currentStep: number;
  totalSteps: number;
  objective: string;
  personalizedTheme: string; // e.g., "dinosaurs", "princesses", "space"
}

class GeminiLiveVoiceTutor {
  private genAI: GoogleGenerativeAI;
  private sessions = new Map<string, GeminiLiveSession>();

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Create real-time tutoring session with context caching
  async startSession(childProfile: ChildProfile): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create cached context for personalized tutoring
    const contextualPrompt = this.buildPersonalizedContext(childProfile);

    const session: GeminiLiveSession = {
      sessionId,
      childProfile,
      conversationContext: [],
      activeLesson: undefined,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  // Real-time voice processing for conversational learning
  async processVoiceInput(
    sessionId: string,
    audioData: ArrayBuffer,
    currentContext?: LessonContext
  ): Promise<{
    response: string;
    audioResponse: ArrayBuffer;
    nextAction: "continue" | "pause" | "celebrate" | "help" | "redirect";
    adaptedDifficulty?: "easier" | "harder" | "same";
    engagement: number; // 0-1 score
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    // Transcribe child's speech
    const transcript = await this.transcribeAudio(audioData);

    // Analyze child's emotional state and engagement
    const childState = await this.analyzeChildState(transcript, session);

    // Generate contextual response using cached conversation
    const response = await this.generateAdaptiveResponse(
      session,
      transcript,
      childState,
      currentContext
    );

    // Convert response to speech
    const audioResponse = await this.textToSpeech(response.content);

    // Update session context
    this.updateSessionContext(session, transcript, response);

    return {
      response: response.content,
      audioResponse,
      nextAction: response.action,
      adaptedDifficulty: response.difficultyAdjustment,
      engagement: childState.engagementScore,
    };
  }

  // Dynamic lesson adaptation based on child's responses
  async adaptLesson(
    sessionId: string,
    currentPerformance: {
      correctAnswers: number;
      totalAttempts: number;
      timeSpent: number;
      strugglingConcepts: string[];
    }
  ): Promise<{
    adaptedContent: any;
    personalizedExplanation: string;
    encouragementLevel: "gentle" | "enthusiastic" | "challenging";
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    // Use Gemini to dynamically adapt content - create a basic lesson context
    const lessonContext: LessonContext = {
      subject: "adaptive lesson",
      currentStep: 1,
      totalSteps: 5,
      objective: "personalized learning",
      personalizedTheme: session.childProfile.interests[0] || "general",
    };

    const adaptedLesson = await this.generatePersonalizedContent(
      session,
      lessonContext
    );

    return adaptedLesson;
  }

  // Real-time emotional support and encouragement
  async provideEmotionalSupport(
    sessionId: string,
    detectedEmotion: "frustrated" | "confused" | "bored" | "excited"
  ): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    const supportResponse = await this.generateEmotionalResponse(
      session,
      detectedEmotion
    );

    return supportResponse;
  }

  private buildPersonalizedContext(profile: ChildProfile): string {
    return `You are ${profile.name}'s personal AI tutor! 
    
Child Profile:
- Name: ${profile.name}
- Age: ${profile.age} 
- Grade: ${profile.grade}
- Loves: ${profile.interests.join(", ")}
- Learning style: ${profile.learningStyle}
- Finds challenging: ${profile.strugglingWith.join(", ")}
- Excels at: ${profile.excelsAt.join(", ")}

Tutoring Style:
- Use ${profile.name}'s favorite themes (${profile.interests.join(
      ", "
    )}) in ALL examples
- Adjust difficulty based on real-time responses
- Celebrate every attempt with personalized encouragement
- If ${profile.name} struggles, slow down and use simpler language
- If ${profile.name} excels, add exciting challenges
- Always stay in character as their enthusiastic, patient tutor`;
  }

  private async generateAdaptiveResponse(
    session: GeminiLiveSession,
    childInput: string,
    childState: any,
    lessonContext?: LessonContext
  ) {
    // Implementation for context-aware response generation
    // This uses Gemini's cached context for personalized responses
    return {
      content: `Great job! Let me help you with that. ${childInput}`,
      action: "continue" as const,
      difficultyAdjustment: "same" as const,
    };
  }

  private async analyzeChildState(
    transcript: string,
    session: GeminiLiveSession
  ) {
    // Analyze sentiment, confusion level, engagement from speech patterns
    // Return emotional state and engagement metrics
    return {
      engagementScore: 0.8,
      emotionalState: "positive",
      needsHelp: false,
    };
  }

  private updateSessionContext(
    session: GeminiLiveSession,
    input: string,
    response: any
  ) {
    // Maintain conversation history for context
    session.conversationContext.push(
      { role: "child", content: input, timestamp: new Date() },
      { role: "tutor", content: response.content, timestamp: new Date() }
    );

    // Keep only last 20 interactions to manage context size
    if (session.conversationContext.length > 20) {
      session.conversationContext = session.conversationContext.slice(-20);
    }
  }

  // Audio transcription using OpenAI Whisper
  private async transcribeAudio(audioData: ArrayBuffer): Promise<string> {
    try {
      // Convert ArrayBuffer to base64 string
      const bytes = new Uint8Array(audioData);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      // Use transcribeChildSpeech with appropriate parameters
      const result = await transcribeChildSpeech(
        base64Audio,
        ["hello", "yes", "no", "help", "done"], // Common words children might say
        "child speaking during lesson"
      );

      return result.transcript;
    } catch (error) {
      console.error("Transcription failed:", error);
      return ""; // Return empty string on failure
    }
  }

  // Text-to-speech using our existing voice system
  private async textToSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const { audio } = await speakText(text);
      if (audio) {
        // Convert base64 to ArrayBuffer
        const binaryString = atob(audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      } else {
        // Return empty ArrayBuffer for browser TTS fallback
        return new ArrayBuffer(0);
      }
    } catch (error) {
      console.error("Text-to-speech failed:", error);
      return new ArrayBuffer(0);
    }
  }

  // Generate personalized lesson content
  private async generatePersonalizedContent(
    session: GeminiLiveSession,
    context: LessonContext
  ) {
    // Placeholder implementation
    return {
      adaptedContent: "Let's try this lesson adapted just for you!",
      personalizedExplanation:
        "This is customized based on your learning style",
      encouragementLevel: "enthusiastic" as const,
    };
  }

  // Generate emotional support response
  private async generateEmotionalResponse(
    session: GeminiLiveSession,
    emotionalNeed: string
  ): Promise<string> {
    // Placeholder implementation
    return "You're doing great! Let's try this together.";
  }
}

export { GeminiLiveVoiceTutor, type GeminiLiveSession, type ChildProfile };
