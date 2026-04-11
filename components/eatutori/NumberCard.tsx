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
  const [isPlaying, setIsPlaying] = useState(false);

  // Child echo pause — time given for the child to repeat the number aloud
  const echoPauseMs = 3000;

  // Speak via API with browser TTS fallback
  const speak = async (text: string, rate = 0.8): Promise<void> => {
    try {
      const { audio } = await speakText(text, rate, userGrade);
      await playAudio(audio);
    } catch {
      await browserSpeak(text, rate);
    }
  };

  const browserSpeak = (text: string, rate = 0.8): Promise<void> =>
    new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate; u.pitch = 1.1; u.volume = 0.8;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });

  // Sequential learning flow — runs once per number
  useEffect(() => {
    if (!autoStart) return;
    let cancelled = false;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 800)); // "see" pause
      if (cancelled) return;

      setPhase('hear');
      setIsPlaying(true);
      const script = showObjects
        ? `This is the number ${number}. You can see ${number} ${objectType}${number > 1 ? 's' : ''}.`
        : `This is the number ${number}.`;
      await speak(script, 0.8);
      setIsPlaying(false);
      if (cancelled) return;

      setPhase('say');
      setIsPlaying(true);
      await speak(`Now you say it. ${number}`, 0.75);
      setIsPlaying(false);
      if (cancelled) return;

      // Pause for child to echo — no mic needed
      await new Promise((r) => setTimeout(r, echoPauseMs));
      if (cancelled) return;

      setPhase('feedback');
      setIsPlaying(true);
      await speak(`Great job! The number is ${number}.`, 0.8);
      setIsPlaying(false);
      if (cancelled) return;

      setPhase('trace');
      await new Promise((r) => setTimeout(r, 2000));
      if (cancelled) return;

      setPhase('complete');
      onComplete?.();
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number]);

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
      case 'hear': return isPlaying ? 'Listen carefully...' : 'Ready!';
      case 'say': return 'Now you say it!';
      case 'trace': return 'Great! Now practice writing';
      case 'feedback': return 'Well done!';
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
      <div className={`w-[400px] h-[400px] ${getPhaseColor()} rounded-3xl flex flex-col items-center justify-center shadow-xl transition-all duration-500 transform ${phase === 'say' ? 'scale-105 ring-4 ring-yellow-300' : ''}`}>
        
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
              Say: "{number}"
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