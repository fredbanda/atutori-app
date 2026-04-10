// lib/gemini-live-integration.ts
// Connects your existing lesson system with Gemini Live
// Bridges static lessons with real-time conversational AI

import { GeminiLiveVoiceTutor, type ChildProfile } from "./gemini-live";
import { generateLesson, type GeneratedLesson } from "./generate-lesson";
import { redis } from "./redis";

interface EnhancedLessonSession {
  sessionId: string;
  childProfile: ChildProfile;
  staticLesson: GeneratedLesson;
  conversationHistory: ConversationTurn[];
  adaptations: LessonAdaptation[];
  currentStep: number;
  engagementScore: number;
}

interface ConversationTurn {
  timestamp: Date;
  childInput: string;
  tutorResponse: string;
  stepContext: number;
  childEmotion?: "excited" | "confused" | "bored" | "frustrated";
  adaptedContent?: any;
}

interface LessonAdaptation {
  reason: "difficulty" | "interest" | "emotion" | "engagement";
  originalContent: any;
  adaptedContent: any;
  effectiveness?: number; // 0-1 score after testing
}

class GeminiLiveLessonIntegration {
  private geminiTutor: GeminiLiveVoiceTutor;
  private sessions = new Map<string, EnhancedLessonSession>();

  constructor(geminiApiKey: string) {
    this.geminiTutor = new GeminiLiveVoiceTutor(geminiApiKey);
  }

  // Start enhanced lesson with both static content and live adaptation
  async startEnhancedLesson(
    childProfile: ChildProfile,
    grade: number,
    subjectId: string
  ): Promise<string> {
    // 1. Generate base lesson using your existing system
    const lessonResult = await generateLesson(grade, subjectId);

    // 2. Create personalized context for Gemini
    const sessionId = await this.geminiTutor.startSession(childProfile);

    // 3. Create enhanced session
    const enhancedSession: EnhancedLessonSession = {
      sessionId,
      childProfile,
      staticLesson: lessonResult.lesson,
      conversationHistory: [],
      adaptations: [],
      currentStep: 0,
      engagementScore: 0.8,
    };

    this.sessions.set(sessionId, enhancedSession);

    // 4. Cache for analytics
    await redis.set(
      `live-session:${sessionId}`,
      JSON.stringify(enhancedSession),
      "EX",
      60 * 60 * 2 // 2 hours
    );

    return sessionId;
  }

  // Process child's voice input with lesson context
  async processLessonInteraction(
    sessionId: string,
    audioData: ArrayBuffer,
    currentStepIndex: number
  ): Promise<{
    response: string;
    audioResponse: ArrayBuffer;
    adaptedStep?: any;
    shouldAdvance: boolean;
    engagementUpdate: number;
    personalizedEncouragement: string;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    const currentStep = session.staticLesson.steps[currentStepIndex];

    // Process with Gemini Live
    const geminiResponse = await this.geminiTutor.processVoiceInput(
      sessionId,
      audioData,
      {
        subject: session.staticLesson.subject,
        currentStep: currentStepIndex,
        totalSteps: session.staticLesson.steps.length,
        objective: session.staticLesson.title,
        personalizedTheme: session.childProfile.interests[0],
      }
    );

    // Adapt current step based on child's response
    const adaptedStep = await this.adaptStepContent(
      session,
      currentStep,
      geminiResponse.response,
      geminiResponse.engagement
    );

    // Update session
    session.conversationHistory.push({
      timestamp: new Date(),
      childInput: "Voice input", // Would be transcribed
      tutorResponse: geminiResponse.response,
      stepContext: currentStepIndex,
      adaptedContent: adaptedStep,
    });

    session.engagementScore = geminiResponse.engagement;

    // Generate personalized encouragement
    const encouragement = await this.generatePersonalizedEncouragement(
      session,
      geminiResponse.engagement
    );

    return {
      response: geminiResponse.response,
      audioResponse: geminiResponse.audioResponse,
      adaptedStep,
      shouldAdvance: geminiResponse.nextAction === "continue",
      engagementUpdate: geminiResponse.engagement,
      personalizedEncouragement: encouragement,
    };
  }

  // Dynamically adapt lesson content based on child's performance
  private async adaptStepContent(
    session: EnhancedLessonSession,
    originalStep: any,
    childResponse: string,
    engagement: number
  ): Promise<any> {
    // If engagement is low, simplify and add child's interests
    if (engagement < 0.6) {
      const simplifiedStep = await this.simplifyWithInterests(
        originalStep,
        session.childProfile.interests
      );

      session.adaptations.push({
        reason: "engagement",
        originalContent: originalStep,
        adaptedContent: simplifiedStep,
      });

      return simplifiedStep;
    }

    // If engagement is high, add challenge
    if (engagement > 0.8) {
      const challengingStep = await this.addChallenge(
        originalStep,
        session.childProfile
      );

      session.adaptations.push({
        reason: "difficulty",
        originalContent: originalStep,
        adaptedContent: challengingStep,
      });

      return challengingStep;
    }

    return originalStep;
  }

  private async simplifyWithInterests(
    step: any,
    interests: string[]
  ): Promise<any> {
    // Use Gemini to rewrite content with child's interests and simpler language
    const prompt = `
    Rewrite this lesson step to be simpler and use themes about ${interests.join(
      ", "
    )}:
    
    Original: ${JSON.stringify(step)}
    
    Make it:
    - Use simpler words for a 5-year-old
    - Include ${interests[0]} in all examples
    - More encouraging and fun
    - Same learning objective but easier to understand
    `;

    // Implementation would call Gemini API
    // Return adapted step
    return step; // Placeholder
  }

  private async addChallenge(step: any, profile: ChildProfile): Promise<any> {
    // Use Gemini to add appropriate challenge based on child's profile
    const prompt = `
    Add a fun challenge to this lesson step for ${
      profile.name
    } who loves ${profile.interests.join(", ")}:
    
    Original: ${JSON.stringify(step)}
    
    Add:
    - One extra question that's slightly harder
    - Use ${profile.interests[0]} theme
    - Keep it fun and achievable
    - Celebrate their advanced thinking
    `;

    // Implementation would call Gemini API
    return step; // Placeholder
  }

  private async generatePersonalizedEncouragement(
    session: EnhancedLessonSession,
    engagement: number
  ): Promise<string> {
    const profile = session.childProfile;
    const recentHistory = session.conversationHistory.slice(-3);

    if (engagement < 0.5) {
      return `${profile.name}, you're doing great! Let's try something with ${profile.interests[0]} to make it more fun!`;
    }

    if (engagement > 0.8) {
      return `Wow ${profile.name}! You're absolutely brilliant at this! Ready for an even more exciting challenge with ${profile.interests[0]}?`;
    }

    return `Perfect, ${profile.name}! You're learning so well. Let's keep going with our ${profile.interests[0]} adventure!`;
  }

  // Get session analytics for teachers/parents
  async getSessionAnalytics(sessionId: string): Promise<{
    totalTime: number;
    averageEngagement: number;
    conceptsMastered: string[];
    areasForImprovement: string[];
    adaptationsMade: number;
    personalizedMoments: string[];
    recommendationsForNext: string[];
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    const analytics = {
      totalTime: session.conversationHistory.length * 30, // Rough estimate
      averageEngagement: session.engagementScore,
      conceptsMastered: this.extractMasteredConcepts(session),
      areasForImprovement: this.identifyImprovementAreas(session),
      adaptationsMade: session.adaptations.length,
      personalizedMoments: this.extractPersonalizedMoments(session),
      recommendationsForNext: this.generateRecommendations(session),
    };

    return analytics;
  }

  private extractMasteredConcepts(session: EnhancedLessonSession): string[] {
    // Analyze conversation to identify what child understood well
    return ["Basic counting", "Number recognition"]; // Placeholder
  }

  private identifyImprovementAreas(session: EnhancedLessonSession): string[] {
    // Analyze where child struggled or engagement dropped
    return ["Number writing", "Skip counting"]; // Placeholder
  }

  private extractPersonalizedMoments(session: EnhancedLessonSession): string[] {
    // Find moments where personalization worked well
    return [
      "Loved the dinosaur counting examples!",
      "Got excited when we talked about space exploration",
    ];
  }

  private generateRecommendations(session: EnhancedLessonSession): string[] {
    // AI-generated suggestions for future lessons
    return [
      "Continue using dinosaur themes - very engaging",
      "Practice number writing with fun tracing activities",
      "Ready for slightly harder counting challenges",
    ];
  }
}

export { GeminiLiveLessonIntegration, type EnhancedLessonSession };
