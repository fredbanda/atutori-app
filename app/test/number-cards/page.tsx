import { Suspense } from "react";
import NumberCard from "@/components/eatutori/NumberCard";
import NumberSequence from "@/components/eatutori/NumberSequence";

export default function NumberCardsTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🧮 AI Number Learning System
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Revolutionary voice-assisted education for young learners
          </p>
          <p className="text-lg text-gray-600">
            See → Hear → Say → Trace → Master!
          </p>
        </div>

        {/* Test Sections */}
        <div className="space-y-16">
          {/* Single Number Card Demo */}
          <section className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              🎯 Single Number Learning
            </h2>
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Experience the complete learning flow for one number
              </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <NumberCard
                number={3}
                userGrade={1}
                showObjects={true}
                objectType="apple"
                autoStart={false}
              />
            </Suspense>
          </section>

          {/* Number Sequence Demo */}
          <section className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              📚 Number Sequence Learning
            </h2>
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Practice multiple numbers in sequence with progress tracking
              </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <NumberSequence
                numbers={[1, 2, 3]}
                userGrade={1}
                showObjects={true}
                objectType="star"
                onSequenceComplete={() => console.log("Sequence completed!")}
              />
            </Suspense>
          </section>

          {/* Feature Showcase */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
              ✨ Revolutionary Learning Features
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-4xl mb-4">👀</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Visual Learning
                </h3>
                <p className="text-gray-600">
                  Clean number display with counting objects for concrete
                  understanding
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-4xl mb-4">🔊</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  AI Voice Teacher
                </h3>
                <p className="text-gray-600">
                  Premium TTS with grade-appropriate speed and natural
                  pronunciation
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-4xl mb-4">🗣️</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Speech Recognition
                </h3>
                <p className="text-gray-600">
                  Real-time pronunciation evaluation with intelligent feedback
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Adaptive Learning
                </h3>
                <p className="text-gray-600">
                  Adjusts difficulty and provides extra support when needed
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Motor Skills
                </h3>
                <p className="text-gray-600">
                  Tracing practice for number formation and fine motor
                  development
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-4xl mb-4">💖</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Positive Reinforcement
                </h3>
                <p className="text-gray-600">
                  Encouraging feedback that builds confidence and motivation
                </p>
              </div>
            </div>
          </section>

          {/* Learning Phases Breakdown */}
          <section className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
              🎯 Learning Phase Breakdown
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-6 p-4 bg-blue-50 rounded-2xl">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-800 mb-2">
                    👀 SEE - Visual Recognition
                  </h3>
                  <p className="text-gray-700">
                    Child sees the number clearly displayed with optional
                    counting objects
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 bg-green-50 rounded-2xl">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    🔊 HEAR - Audio Learning
                  </h3>
                  <p className="text-gray-700">
                    AI teacher pronounces the number with perfect clarity and
                    appropriate speed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 bg-yellow-50 rounded-2xl">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-yellow-700 mb-2">
                    🗣️ SAY - Speech Practice
                  </h3>
                  <p className="text-gray-700">
                    Child practices saying the number with real-time
                    pronunciation feedback
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 bg-purple-50 rounded-2xl">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-800 mb-2">
                    ✍️ TRACE - Motor Skills
                  </h3>
                  <p className="text-gray-700">
                    Guided tracing practice to develop number writing skills
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 bg-emerald-50 rounded-2xl">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">
                    ✅ MASTER - Success Celebration
                  </h3>
                  <p className="text-gray-700">
                    Positive reinforcement and progress tracking to build
                    confidence
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Expandable Applications */}
          <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
              🚀 Expandable to All Learning
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                <div className="text-5xl mb-4">🔢</div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  Numbers
                </h3>
                <p className="text-sm text-gray-600">
                  1-100, counting, basic math facts
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                <div className="text-5xl mb-4">🔤</div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  Letters
                </h3>
                <p className="text-sm text-gray-600">
                  Alphabet, phonics, letter sounds
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                <div className="text-5xl mb-4">📖</div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">Words</h3>
                <p className="text-sm text-gray-600">
                  Sight words, spelling, vocabulary
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  Concepts
                </h3>
                <p className="text-sm text-gray-600">
                  Colors, shapes, patterns
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 p-8">
          <p className="text-gray-600 text-lg">
            🌟 Built with bulletproof voice AI technology for revolutionary
            early childhood education
          </p>
        </div>
      </div>
    </div>
  );
}
