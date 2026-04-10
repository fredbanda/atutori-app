import NumberCard from "@/components/eatutori/NumberCard";

export default function NumberCardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔢 AI Number Learning Cards
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Revolutionary voice-assisted learning for Grades 1-3
          </p>
          <p className="text-lg text-gray-500">
            See → Hear → Say → Trace → Succeed!
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid gap-12">
          {/* Number Only Card */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              📚 Basic Number Learning
            </h2>
            <NumberCard number={2} userGrade={1} autoStart={true} />
          </div>

          {/* Number with Objects Card */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              🍎 Number with Counting Objects
            </h2>
            <NumberCard
              number={3}
              userGrade={1}
              showObjects={true}
              objectType="apple"
              autoStart={false}
            />
          </div>

          {/* Different Objects */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              ⭐ Number with Stars
            </h2>
            <NumberCard
              number={5}
              userGrade={2}
              showObjects={true}
              objectType="star"
              autoStart={false}
            />
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
            ✨ Revolutionary Learning Features
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">👀</span>
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    Visual Learning
                  </h4>
                  <p className="text-gray-600">
                    Clean, distraction-free number display with optional
                    counting objects
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl">🔊</span>
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    AI Voice Teacher
                  </h4>
                  <p className="text-gray-600">
                    Premium TTS with grade-appropriate speed and natural
                    pronunciation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl">🗣️</span>
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    Speech Recognition
                  </h4>
                  <p className="text-gray-600">
                    Real-time pronunciation evaluation with intelligent feedback
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">✍️</span>
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    Tracing Practice
                  </h4>
                  <p className="text-gray-600">
                    Motor skills development with guided number writing
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl">🧠</span>
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    Adaptive Learning
                  </h4>
                  <p className="text-gray-600">
                    Adjusts difficulty based on child's responses and attempts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl">💖</span>
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    Encouraging Feedback
                  </h4>
                  <p className="text-gray-600">
                    Positive reinforcement with patience for struggling learners
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            🚀 Expandable to All Subjects
          </h3>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <span className="text-4xl block mb-3">🔢</span>
              <h4 className="font-semibold text-gray-800 mb-2">
                Numbers & Math
              </h4>
              <p className="text-sm text-gray-600">
                1-10, basic addition, counting objects
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <span className="text-4xl block mb-3">🔤</span>
              <h4 className="font-semibold text-gray-800 mb-2">
                Letters & Phonics
              </h4>
              <p className="text-sm text-gray-600">
                Alphabet, letter sounds, word building
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <span className="text-4xl block mb-3">📖</span>
              <h4 className="font-semibold text-gray-800 mb-2">Sight Words</h4>
              <p className="text-sm text-gray-600">
                High-frequency words, reading fluency
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
