// components/voice/GeminiLiveSession.tsx
// Real-time voice tutoring component for Grades 1-3

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Heart, Brain, Sparkles } from "lucide-react";
import { GeminiLiveVoiceTutor, type ChildProfile } from "@/lib/gemini-live";

interface GeminiLiveSessionProps {
  childProfile: ChildProfile;
  lessonSubject: string;
  onSessionEnd: (summary: SessionSummary) => void;
}

interface SessionSummary {
  duration: number;
  engagement: number;
  concepts_learned: string[];
  areas_to_review: string[];
  favorite_moments: string[];
}

export function GeminiLiveSession({
  childProfile,
  lessonSubject,
  onSessionEnd,
}: GeminiLiveSessionProps) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [engagement, setEngagement] = useState(0.8);
  const [sessionTime, setSessionTime] = useState(0);
  const [tutorEmotion, setTutorEmotion] = useState<
    "calm" | "excited" | "encouraging"
  >("excited");

  const tutorRef = useRef<GeminiLiveVoiceTutor | null>(null);
  const sessionId = useRef<string>("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize Gemini Live session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        tutorRef.current = new GeminiLiveVoiceTutor(
          process.env.NEXT_PUBLIC_GEMINI_API_KEY!
        );
        sessionId.current = await tutorRef.current.startSession(childProfile);
        setIsActive(true);

        // Start with personalized greeting
        await playWelcomeMessage();
      } catch (error) {
        console.error("Failed to initialize Gemini Live session:", error);
      }
    };

    initializeSession();
  }, [childProfile]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const startListening = useCallback(async () => {
    if (!navigator.mediaDevices) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);

      mediaRecorder.current = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioBuffer = await audioBlob.arrayBuffer();

        // Process with Gemini Live
        if (tutorRef.current && sessionId.current) {
          const response = await tutorRef.current.processVoiceInput(
            sessionId.current,
            audioBuffer,
            {
              subject: lessonSubject,
              currentStep: 1,
              totalSteps: 6,
              objective: `Learning ${lessonSubject} with ${childProfile.interests.join(
                " and "
              )}`,
              personalizedTheme: childProfile.interests[0],
            }
          );

          // Update UI based on response
          setCurrentResponse(response.response);
          setEngagement(response.engagement);

          // Play tutor's audio response
          await playAudioResponse(response.audioResponse);

          // Adapt UI based on next action
          handleTutorAction(response.nextAction);
        }
      };

      mediaRecorder.current.start();

      // Auto-stop after 10 seconds to prevent long recordings
      setTimeout(() => {
        if (
          mediaRecorder.current &&
          mediaRecorder.current.state === "recording"
        ) {
          mediaRecorder.current.stop();
          setIsListening(false);
        }
      }, 10000);
    } catch (error) {
      console.error("Microphone access denied:", error);
      setIsListening(false);
    }
  }, [lessonSubject, childProfile]);

  const stopListening = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setIsListening(false);
    }
  }, []);

  const playWelcomeMessage = async () => {
    const welcomeText = `Hi ${childProfile.name}! I'm so excited to learn about ${lessonSubject} with you today! I know you love ${childProfile.interests[0]}, so we're going to use ${childProfile.interests[0]} in all our examples. Are you ready for an amazing adventure?`;

    setCurrentResponse(welcomeText);
    // Convert to speech and play
    // Implementation depends on your TTS setup
  };

  const playAudioResponse = async (audioBuffer: ArrayBuffer) => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }

    const audioBufferNode = await audioContext.current.decodeAudioData(
      audioBuffer
    );
    const source = audioContext.current.createBufferSource();
    source.buffer = audioBufferNode;
    source.connect(audioContext.current.destination);
    source.start();
  };

  const handleTutorAction = (action: string) => {
    switch (action) {
      case "celebrate":
        setTutorEmotion("excited");
        // Show celebration animation
        break;
      case "help":
        setTutorEmotion("encouraging");
        // Show helping hand animation
        break;
      case "pause":
        // Give child time to think
        break;
      default:
        setTutorEmotion("calm");
    }
  };

  const endSession = async () => {
    setIsActive(false);

    const summary: SessionSummary = {
      duration: sessionTime,
      engagement,
      concepts_learned: ["Example concept"], // From session data
      areas_to_review: ["Example area"], // From session data
      favorite_moments: ["When we talked about dinosaurs!"], // From session data
    };

    onSessionEnd(summary);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="max-w-4xl mx-auto p-6">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"
              }`}
            />
            <h2 className="text-xl font-bold">
              Live Tutoring with {childProfile.name}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {Math.floor(sessionTime / 60)}:
              {(sessionTime % 60).toString().padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span>{Math.round(engagement * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Tutor Avatar & Response */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-300 ${
              tutorEmotion === "excited"
                ? "bg-yellow-200 animate-bounce"
                : tutorEmotion === "encouraging"
                ? "bg-green-200 animate-pulse"
                : "bg-blue-200"
            }`}
          >
            {tutorEmotion === "excited" ? (
              <Sparkles className="h-10 w-10 text-yellow-600" />
            ) : tutorEmotion === "encouraging" ? (
              <Heart className="h-10 w-10 text-green-600" />
            ) : (
              <Brain className="h-10 w-10 text-blue-600" />
            )}
          </div>

          {currentResponse && (
            <div className="bg-white rounded-lg p-4 shadow-sm max-w-2xl mx-auto">
              <p className="text-lg leading-relaxed">{currentResponse}</p>
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            disabled={!isActive}
            className="px-8 py-6 text-lg"
          >
            {isListening ? (
              <>
                <MicOff className="h-6 w-6 mr-2" />
                Listening... (Release to send)
              </>
            ) : (
              <>
                <Mic className="h-6 w-6 mr-2" />
                Hold to Talk
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={endSession}
            className="px-6 py-6"
          >
            End Session
          </Button>
        </div>

        {/* Engagement Indicator */}
        <div className="mt-6 bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Engagement Level</span>
            <span className="text-sm text-gray-600">
              {Math.round(engagement * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${engagement * 100}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default GeminiLiveSession;
