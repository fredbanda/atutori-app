"use client";

import { useState, useEffect } from 'react';
import { speakText } from '@/lib/actions/voice';

interface NumberCardProps {
  number: number;
  userGrade: 1 | 2 | 3;
  showObjects?: boolean;
  objectType?: 'apple' | 'star' | 'circle' | 'square';
  onComplete?: () => void;
  autoStart?: boolean;
}

type LearningPhase = 'see' | 'hear' | 'say' | 'trace' | 'feedback' | 'complete';

export default function NumberCard({ 
  number, 
  userGrade,
  showObjects = false,
  objectType = 'apple',
  onComplete,
  autoStart = true
}: NumberCardProps) {
  const [phase, setPhase] = useState<LearningPhase>('see');
  const [isListening, setIsListening] = useState(false);
  const [userResponse, setUserResponse] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-start the learning sequence
  useEffect(() => {
    if (autoStart && phase === 'see') {
      setTimeout(() => {
        startHearPhase();
      }, 1000);
    }
  }, [autoStart]);

  // Phase 1: Visual Display (See)
  const startHearPhase = async () => {
    setPhase('hear');
    setIsPlaying(true);
    
    try {
      const script = showObjects 
        ? `This is the number ${number}. You can see ${number} ${objectType}${number > 1 ? 's' : ''}.`
        : `This is the number ${number}.`;
      
      const { audio } = await speakText(script, 0.8, userGrade);
      await playAudio(audio);
      
      setTimeout(() => {
        startSayPhase();
      }, 1500);
    } catch (error) {
      console.error('TTS failed:', error);
      setTimeout(() => startSayPhase(), 2000);
    } finally {
      setIsPlaying(false);
    }
  };

  // Phase 2: Speech Input (Say)
  const startSayPhase = async () => {
    setPhase('say');
    setIsPlaying(true);
    
    try {
      const prompt = attempts === 0 
        ? `Now you say: ${number}`
        : attempts === 1 
          ? `Try again, say: ${number}`
          : `Let's try once more. Say: ${number}`;
      
      const { audio } = await speakText(prompt, 0.75, userGrade);
      await playAudio(audio);
      
      setTimeout(() => {
        startListening();
      }, 1000);
    } catch (error) {
      console.error('TTS failed:', error);
      setTimeout(() => startListening(), 1500);
    } finally {
      setIsPlaying(false);
    }
  };

  // Phase 3: Listen for user response
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Fallback: simulate correct answer
      setTimeout(() => {
        handleSpeechResult(number.toString());
      }, 1000);
      return;
    }

    setIsListening(true);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setUserResponse(transcript);
      handleSpeechResult(transcript);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
      // Retry or give hint after error
      setTimeout(() => {
        if (attempts < 2) {
          startSayPhase();
        } else {
          giveFinalFeedback();
        }
      }, 1000);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
    
    // Auto-stop after 5 seconds
    setTimeout(() => {
      recognition.stop();
    }, 5000);
  };

  // Evaluate user's speech
  const handleSpeechResult = async (transcript: string) => {
    setIsListening(false);
    setPhase('feedback');
    
    const expectedAnswers = [
      number.toString(),
      getNumberWord(number),
      `${number}`,
    ];
    
    const isCorrect = expectedAnswers.some(answer => 
      transcript.includes(answer.toLowerCase()) || 
      answer.toLowerCase().includes(transcript)
    );
    
    if (isCorrect) {
      await giveSuccessFeedback();
    } else {
      setAttempts(prev => prev + 1);
      if (attempts < 2) {
        await giveCorrectionFeedback();
      } else {
        await giveFinalFeedback();
      }
    }
  };

  // Success feedback
  const giveSuccessFeedback = async () => {
    const successMessages = [
      "Excellent! You said it perfectly!",
      "Great job! That's exactly right!",
      "Wonderful! You know your numbers!",
      "Perfect! You're learning so well!"
    ];
    
    const message = successMessages[Math.floor(Math.random() * successMessages.length)];
    setFeedback(message);
    
    try {
      const { audio } = await speakText(message, 0.8, userGrade);
      await playAudio(audio);
    } catch (error) {
      console.error('Feedback TTS failed:', error);
    }
    
    setTimeout(() => {
      setPhase('trace');
      setTimeout(() => {
        setPhase('complete');
        onComplete?.();
      }, 3000);
    }, 2000);
  };

  // Correction feedback
  const giveCorrectionFeedback = async () => {
    const message = `I heard "${userResponse}". The correct answer is ${number}. Let's try again!`;
    setFeedback(message);
    
    try {
      const { audio } = await speakText(message, 0.7, userGrade);
      await playAudio(audio);
    } catch (error) {
      console.error('Correction TTS failed:', error);
    }
    
    setTimeout(() => {
      startSayPhase();
    }, 2500);
  };

  // Final attempt feedback
  const giveFinalFeedback = async () => {
    const message = `That's okay! The answer is ${number}. You'll get it next time!`;
    setFeedback(message);
    
    try {
      const { audio } = await speakText(message, 0.8, userGrade);
      await playAudio(audio);
    } catch (error) {
      console.error('Final feedback TTS failed:', error);
    }
    
    setTimeout(() => {
      setPhase('trace');
      setTimeout(() => {
        setPhase('complete');
        onComplete?.();
      }, 3000);
    }, 2000);
  };

  // Helper function to play audio
  const playAudio = (base64: string): Promise<void> => {
    return new Promise((resolve) => {
      if (base64.startsWith('browser_tts:')) {
        const text = base64.replace('browser_tts:', '');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        
        speechSynthesis.speak(utterance);
      } else {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      }
    });
  };

  // Convert number to word
  const getNumberWord = (num: number): string => {
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    return words[num] || num.toString();
  };

  // Render objects for visual counting
  const renderObjects = () => {
    if (!showObjects) return null;
    
    const objects = [];
    for (let i = 0; i < number; i++) {
      objects.push(
        <div key={i} className="object">
          {objectType === 'apple' && <span className="text-6xl">🍎</span>}
          {objectType === 'star' && <span className="text-6xl">⭐</span>}
          {objectType === 'circle' && <div className="w-12 h-12 bg-blue-500 rounded-full"></div>}
          {objectType === 'square' && <div className="w-12 h-12 bg-red-500 rounded-md"></div>}
        </div>
      );
    }
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mb-6 max-w-sm">
        {objects}
      </div>
    );
  };

  // Phase indicators
  const getPhaseColor = () => {
    switch (phase) {
      case 'see': return 'bg-blue-600';
      case 'hear': return 'bg-green-600';
      case 'say': return 'bg-yellow-500';
      case 'trace': return 'bg-purple-600';
      case 'feedback': return 'bg-orange-500';
      case 'complete': return 'bg-emerald-600';
      default: return 'bg-gray-600';
    }
  };

  const getPhaseEmoji = () => {
    switch (phase) {
      case 'see': return '👀';
      case 'hear': return '🔊';
      case 'say': return '🗣️';
      case 'trace': return '✍️';
      case 'feedback': return '💭';
      case 'complete': return '✅';
      default: return '📚';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'see': return 'Look at the number';
      case 'hear': return isPlaying ? 'Listen carefully...' : 'Ready to speak!';
      case 'say': return isListening ? 'Listening...' : 'Say the number';
      case 'trace': return 'Great! Now practice writing';
      case 'feedback': return feedback;
      case 'complete': return 'Lesson complete!';
      default: return 'Learning numbers';
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      {/* Phase Indicator */}
      <div className="mb-6 text-center">
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${getPhaseColor()} text-white text-lg font-semibold shadow-lg transition-all duration-500`}>
          <span className="text-2xl">{getPhaseEmoji()}</span>
          {getPhaseText()}
        </div>
      </div>

      {/* Main Learning Card */}
      <div className={`w-[400px] h-[400px] ${getPhaseColor()} rounded-3xl flex flex-col items-center justify-center shadow-xl transition-all duration-500 transform ${isListening ? 'scale-105 ring-4 ring-yellow-300' : ''}`}>
        
        {/* Objects for counting (if enabled) */}
        {renderObjects()}
        
        {/* Big Number */}
        <span className="text-white text-[180px] font-extrabold leading-none select-none">
          {number}
        </span>

        {/* Phase-specific guidance */}
        <div className="text-center mt-4 px-4">
          {phase === 'say' && (
            <p className="text-white text-xl font-semibold">
              {isListening ? "🎤 I'm listening..." : `Say: "${number}"`}
            </p>
          )}
          
          {phase === 'trace' && (
            <div className="text-white">
              <p className="text-lg mb-2">Now practice tracing!</p>
              <div className="text-6xl opacity-50 font-thin">
                {number}
              </div>
            </div>
          )}
          
          {phase === 'complete' && (
            <div className="text-white text-center">
              <p className="text-2xl mb-2">🎉 Amazing work!</p>
              <p className="text-lg">You learned the number {number}!</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex gap-2">
        {['see', 'hear', 'say', 'trace'].map((stepPhase, index) => (
          <div
            key={stepPhase}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              phase === stepPhase || (phase === 'feedback' && stepPhase === 'say') || phase === 'complete'
                ? 'bg-green-500 scale-125' 
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}