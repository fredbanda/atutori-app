"use client"

import { useState } from "react"
import { Dashboard } from "@/components/atutori/dashboard"
import { LessonView } from "@/components/atutori/lesson-view"
import { QuizView } from "@/components/atutori/quiz-view"
import { ResultsScreen } from "@/components/atutori/results-screen"

type View = "dashboard" | "lesson" | "quiz" | "results"

// Sample lesson data
const lessonData = {
  math: {
    title: "Understanding Fractions",
    content: "A fraction is a way to represent a part of a whole. When we cut a pizza into 4 equal slices and eat 1 slice, we've eaten 1/4 (one-fourth) of the pizza. The top number (numerator) tells us how many parts we have, and the bottom number (denominator) tells us how many equal parts the whole is divided into.",
    example: {
      title: "Let's Practice!",
      content: "If you have 8 strawberries and give 3 to your friend, you can write this as 3/8. This means 3 parts out of 8 total parts. The fraction 3/8 shows that your friend got 3 strawberries from the 8 you had!"
    }
  },
  english: {
    title: "Reading Comprehension",
    content: "Reading comprehension means understanding what you read. When you read a story, try to picture it in your mind like a movie. Ask yourself: Who are the characters? Where does the story happen? What is the main problem? Good readers always think about what they're reading.",
    example: {
      title: "Try This!",
      content: "After reading a paragraph, close the book and tell yourself what happened in your own words. If you can explain it to a friend or family member, you've understood it well!"
    }
  },
  science: {
    title: "The Water Cycle",
    content: "Water is always moving around our planet in a big circle called the water cycle. The sun heats up water in oceans, lakes, and rivers, and it turns into water vapor (this is called evaporation). The vapor goes up into the sky and forms clouds (condensation). When clouds get heavy, water falls back down as rain or snow (precipitation).",
    example: {
      title: "Fun Fact!",
      content: "The water you drink today could be the same water that dinosaurs drank millions of years ago! Water keeps recycling through the water cycle over and over again."
    }
  },
  art: {
    title: "Color Theory Basics",
    content: "Colors can be mixed to create new colors! Red, blue, and yellow are called primary colors because you can't make them by mixing other colors. When you mix two primary colors together, you get secondary colors: red + yellow = orange, blue + yellow = green, and red + blue = purple.",
    example: {
      title: "Let's Experiment!",
      content: "Try mixing red and blue paint together. What color do you get? Now try adding a tiny bit more red. See how the color changes? This is how artists create all the beautiful colors you see in paintings!"
    }
  },
  music: {
    title: "Understanding Rhythm",
    content: "Rhythm is the pattern of sounds and silences in music. It's what makes you want to tap your foot or clap your hands! Every song has a beat - the steady pulse you feel when listening to music. Some beats are stronger (like when you say 'ONE-two-three-four'), and some are softer.",
    example: {
      title: "Clap Along!",
      content: "Try clapping to your favorite song. Can you feel the beat? Try clapping on every strong beat. That's the rhythm! Even your heartbeat has a rhythm - put your hand on your chest and feel it."
    }
  }
}

// Sample quiz data
const quizData = {
  math: [
    {
      id: 1,
      question: "If a pizza is cut into 8 slices and you eat 3, what fraction of the pizza did you eat?",
      options: ["1/8", "3/8", "8/3", "5/8"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "In the fraction 5/6, what does the number 6 represent?",
      options: ["How many parts you have", "How many parts the whole is divided into", "The total number", "The answer"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "Which fraction shows half of something?",
      options: ["1/4", "1/3", "1/2", "2/4"],
      correctAnswer: 2
    },
    {
      id: 4,
      question: "If you share 12 cookies equally with 3 friends, what fraction does each person get?",
      options: ["3/12", "4/12", "12/3", "1/3"],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "What is the top number of a fraction called?",
      options: ["Denominator", "Numerator", "Whole number", "Factor"],
      correctAnswer: 1
    }
  ],
  english: [
    {
      id: 1,
      question: "What does reading comprehension mean?",
      options: ["Reading fast", "Understanding what you read", "Reading out loud", "Memorizing words"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "What should you try to do in your mind when reading a story?",
      options: ["Count the words", "Picture it like a movie", "Skip the hard parts", "Read backwards"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What is NOT a good question to ask while reading?",
      options: ["Who are the characters?", "Where does the story happen?", "What's for dinner?", "What is the main problem?"],
      correctAnswer: 2
    },
    {
      id: 4,
      question: "How can you tell if you understood what you read?",
      options: ["You read it fast", "You can explain it in your own words", "The book is closed", "You finished the chapter"],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "Good readers always do what while reading?",
      options: ["Skip pages", "Think about what they're reading", "Read with their eyes closed", "Only look at pictures"],
      correctAnswer: 1
    }
  ],
  science: [
    {
      id: 1,
      question: "What is the water cycle?",
      options: ["A type of bicycle", "Water moving in a big circle around the planet", "A water bottle", "A swimming pool"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "What happens during evaporation?",
      options: ["Water freezes", "Water turns into vapor", "Clouds form", "It rains"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What makes water evaporate from oceans and lakes?",
      options: ["The moon", "The sun", "The wind", "Fish"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "When water falls from clouds as rain or snow, this is called:",
      options: ["Evaporation", "Condensation", "Precipitation", "Celebration"],
      correctAnswer: 2
    },
    {
      id: 5,
      question: "What forms when water vapor goes up into the sky?",
      options: ["Rainbows", "Clouds", "Stars", "Mountains"],
      correctAnswer: 1
    }
  ],
  art: [
    {
      id: 1,
      question: "What are the three primary colors?",
      options: ["Red, green, blue", "Red, yellow, blue", "Orange, green, purple", "Black, white, gray"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "What color do you get when you mix red and yellow?",
      options: ["Green", "Purple", "Orange", "Brown"],
      correctAnswer: 2
    },
    {
      id: 3,
      question: "Why are primary colors special?",
      options: ["They're the brightest", "You can't make them by mixing other colors", "They're the oldest", "They're on the rainbow"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "What color do you get when you mix blue and yellow?",
      options: ["Orange", "Purple", "Green", "Red"],
      correctAnswer: 2
    },
    {
      id: 5,
      question: "Orange, green, and purple are called:",
      options: ["Primary colors", "Secondary colors", "Tertiary colors", "Rainbow colors"],
      correctAnswer: 1
    }
  ],
  music: [
    {
      id: 1,
      question: "What is rhythm in music?",
      options: ["The words of a song", "The pattern of sounds and silences", "The name of a song", "The volume of music"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "What is a beat in music?",
      options: ["A drum", "The steady pulse you feel", "A type of dance", "The end of a song"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What makes you want to tap your foot when listening to music?",
      options: ["The singer", "The rhythm", "The title", "The instruments"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "What else has a rhythm, just like music?",
      options: ["Your shadow", "Your heartbeat", "Your shoes", "Your book"],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "In music, some beats are:",
      options: ["Stronger and some are softer", "All the same", "Only loud", "Only quiet"],
      correctAnswer: 0
    }
  ]
}

const subjectNames: Record<string, string> = {
  math: "Math",
  english: "English",
  science: "Science",
  art: "Art",
  music: "Music"
}

export default function AtutoriApp() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [currentSubject, setCurrentSubject] = useState<string>("math")
  const [quizScore, setQuizScore] = useState(0)
  const [quizTotal, setQuizTotal] = useState(0)

  const handleStartLesson = (subject: string) => {
    setCurrentSubject(subject)
    setCurrentView("lesson")
  }

  const handleContinueLearning = () => {
    setCurrentSubject("math")
    setCurrentView("lesson")
  }

  const handleLessonNext = () => {
    setCurrentView("quiz")
  }

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore(score)
    setQuizTotal(total)
    setCurrentView("results")
  }

  const handleRetry = () => {
    setCurrentView("quiz")
  }

  const handleNextLesson = () => {
    // Cycle to next subject
    const subjects = Object.keys(lessonData)
    const currentIndex = subjects.indexOf(currentSubject)
    const nextIndex = (currentIndex + 1) % subjects.length
    setCurrentSubject(subjects[nextIndex])
    setCurrentView("lesson")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
  }

  const lesson = lessonData[currentSubject as keyof typeof lessonData]
  const questions = quizData[currentSubject as keyof typeof quizData]
  const xpEarned = quizScore * 20

  return (
    <>
      {currentView === "dashboard" && (
        <Dashboard
          studentName="Alex"
          onStartLesson={handleStartLesson}
          onContinueLearning={handleContinueLearning}
        />
      )}
      {currentView === "lesson" && (
        <LessonView
          title={lesson.title}
          subject={subjectNames[currentSubject]}
          lessonNumber={1}
          totalLessons={5}
          content={lesson.content}
          example={lesson.example}
          onBack={handleBackToDashboard}
          onNext={handleLessonNext}
        />
      )}
      {currentView === "quiz" && (
        <QuizView
          title={lesson.title}
          subject={subjectNames[currentSubject]}
          questions={questions}
          onBack={handleBackToDashboard}
          onComplete={handleQuizComplete}
        />
      )}
      {currentView === "results" && (
        <ResultsScreen
          score={quizScore}
          total={quizTotal}
          xpEarned={xpEarned}
          subject={subjectNames[currentSubject]}
          lessonTitle={lesson.title}
          onRetry={handleRetry}
          onNextLesson={handleNextLesson}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </>
  )
}
