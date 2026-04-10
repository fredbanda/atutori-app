"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  generateLesson,
  recordLessonAttempt,
  type GeneratedLesson,
  type QuizStep,
} from "@/lib/generate-lesson";
import { preloadLessonAudio } from "@/lib/actions/voice";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Star,
  Lightbulb,
  Volume2,
  VolumeX,
  Loader2,
  Brain,
  Sparkles,
  Mic,
  Hand,
  MicOff,
} from "lucide-react";

// Voice lesson hook for recording and talk-back
import { useVoiceLesson } from "@/hooks/use-voice-lesson";

// Card-based lesson renderer
import CardLessonRenderer from "@/components/eatutori/CardLessonRenderer";

// Gemini Live Integration (conditionally imported)
import dynamic from "next/dynamic";

const GeminiLiveSession = dynamic(
  () =>
    import("@/components/voice/GeminiLiveSession").then((mod) => ({
      default: mod.GeminiLiveSession,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
          <span className="text-purple-700 font-medium">
            Starting Gemini Live Tutor...
          </span>
        </div>
      </div>
    ),
  }
);

// Voice-enabled grade groups (Grades 1–3)
const VOICE_GRADE_GROUPS = new Set(["primary-early"]);

function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve) => {
    // Check if this needs browser TTS fallback
    if (base64.startsWith("browser_tts:")) {
      // Use browser speech synthesis
      const text = base64.replace("browser_tts:", "");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      speechSynthesis.speak(utterance);
    } else {
      // Use base64 audio
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    }
  });
}
const gradeGroupToGrade = {
  "primary-early": [1, 2, 3],
  "primary-mid": [4, 5, 6],
  "primary-upper": [7, 8],
  "high-junior": [9, 10],
  "high-senior": [11, 12],
};

// Subject ID mapping for different grades
const subjectMapping = {
  // Grade 1 subjects
  1: {
    "1": "counting",
    "2": "number-writing",
    "3": "addition-basic",
    "4": "subtraction-basic",
    "5": "shapes-patterns",
    "6": "measurement-comparison",
    "7": "time-sequencing",
    "8": "money-basics",
    // Legacy fallback - map "math" to counting for Grade 1
    math: "counting",
  },
  // Grade 2 subjects (placeholder - can be added later)
  2: {
    "1": "math", // Keep existing for Grade 2
    math: "math", // Direct mapping for Grade 2
  },
  // Add more grades as needed
};

// Get actual subject ID from route parameter and grade
function getSubjectId(routeSubjectId: string, grade: number): string {
  const mapping = subjectMapping[grade as keyof typeof subjectMapping];
  return mapping?.[routeSubjectId as keyof typeof mapping] || routeSubjectId;
}

// Get the appropriate grade for lesson generation
function getGradeFromGroup(gradeGroup: string): number {
  const grades =
    gradeGroupToGrade[gradeGroup as keyof typeof gradeGroupToGrade];

  // For primary-early, use Grade 1 (where our comprehensive curriculum is)
  if (gradeGroup === "primary-early") {
    return 1;
  }

  // For other groups, use the middle grade
  return grades ? grades[Math.floor(grades.length / 2)] : 6; // default to grade 6
}

// Legacy lesson content (fallback only)
const lessonContent: Record<
  string,
  Record<
    string,
    {
      title: string;
      lessons: {
        type: "content" | "quiz";
        title?: string;
        content?: string;
        example?: string;
        question?: string;
        options?: string[];
        correctAnswer?: number;
        explanation?: string;
      }[];
    }
  >
> = {
  "primary-early": {
    // Grade 1 fallback subjects
    counting: {
      title: "Counting Fun",
      lessons: [
        {
          type: "content",
          title: "Numbers 1 to 10",
          content:
            "Let's count together! Numbers help us know how many things we have.",
          example: "1 🐸, 2 🐸🐸, 3 🐸🐸🐸",
        },
        {
          type: "quiz",
          question: "Count the stars: ⭐⭐⭐⭐⭐",
          options: ["3", "4", "5", "6"],
          correctAnswer: 2,
          explanation: "Let's count: 1, 2, 3, 4, 5! There are 5 stars.",
        },
      ],
    },
    "number-writing": {
      title: "Writing Numbers",
      lessons: [
        {
          type: "content",
          title: "How to Write Numbers",
          content:
            "Each number has a special shape. Let's learn to write them!",
          example:
            "Number 1 is like a straight line | Number 2 looks like a swan",
        },
        {
          type: "quiz",
          question: "Which number comes after 3?",
          options: ["2", "4", "5", "6"],
          correctAnswer: 1,
          explanation: "After 3 comes 4! Count: 1, 2, 3, 4",
        },
      ],
    },
    "addition-basic": {
      title: "Basic Addition",
      lessons: [
        {
          type: "content",
          title: "Adding Numbers Together",
          content:
            "When we add, we put groups together to find how many in total!",
          example: "2 + 1 = 3 (Two apples plus one apple equals three apples!)",
        },
        {
          type: "quiz",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
          explanation:
            "2 + 2 = 4! Count: 2 fingers, then 2 more fingers = 4 fingers total!",
        },
      ],
    },
    "subtraction-basic": {
      title: "Basic Subtraction",
      lessons: [
        {
          type: "content",
          title: "Taking Numbers Away",
          content:
            "When we subtract, we take some away to see how many are left!",
          example:
            "5 - 2 = 3 (Start with 5 toys, take away 2, you have 3 left!)",
        },
        {
          type: "quiz",
          question: "What is 4 - 1?",
          options: ["2", "3", "4", "5"],
          correctAnswer: 1,
          explanation:
            "4 - 1 = 3! If you have 4 cookies and eat 1, you have 3 left!",
        },
      ],
    },
    "shapes-patterns": {
      title: "Shapes & Patterns",
      lessons: [
        {
          type: "content",
          title: "Basic Shapes",
          content:
            "Shapes are all around us! Let's learn to recognize circles, squares, and triangles.",
          example:
            "🔴 Circle (like a ball), ⬜ Square (like a box), 🔺 Triangle (like a roof)",
        },
        {
          type: "quiz",
          question: "How many sides does a triangle have?",
          options: ["2", "3", "4", "5"],
          correctAnswer: 1,
          explanation: "A triangle has 3 sides! Count them: 1, 2, 3!",
        },
      ],
    },
    "measurement-comparison": {
      title: "Size & Measurement",
      lessons: [
        {
          type: "content",
          title: "Big and Small",
          content: "We can compare things to see which is bigger or smaller!",
          example: "An elephant 🐘 is bigger than a mouse 🐭",
        },
        {
          type: "quiz",
          question: "Which is longer: a pencil ✏️ or a ruler 📏?",
          options: ["Pencil", "Ruler", "Same size", "Don't know"],
          correctAnswer: 1,
          explanation:
            "A ruler is longer than a pencil! We use rulers to measure things!",
        },
      ],
    },
    "time-sequencing": {
      title: "Time & Order",
      lessons: [
        {
          type: "content",
          title: "What Comes First?",
          content:
            "Things happen in order! Morning comes before afternoon, and afternoon comes before night.",
          example:
            "First we wake up ☀️, then we eat lunch 🍽️, then we go to bed 🌙",
        },
        {
          type: "quiz",
          question: "What comes after morning?",
          options: ["Night", "Afternoon", "Sleep", "Breakfast"],
          correctAnswer: 1,
          explanation:
            "After morning comes afternoon! The sun is high in the sky in the afternoon.",
        },
      ],
    },
    "money-basics": {
      title: "Money Basics",
      lessons: [
        {
          type: "content",
          title: "Coins and Money",
          content:
            "Money helps us buy things! Coins come in different sizes and colors.",
          example:
            "A penny is small and brown 🪙. We use money to buy toys and food!",
        },
        {
          type: "quiz",
          question: "What do we use money for?",
          options: ["Playing games", "Buying things", "Decoration", "Exercise"],
          correctAnswer: 1,
          explanation:
            "We use money to buy things we need, like food, toys, and clothes!",
        },
      ],
    },
    // Original content
    math: {
      title: "Numbers Fun",
      lessons: [
        {
          type: "content",
          title: "Counting to 10",
          content:
            "Let's learn to count! Numbers help us know how many things we have.",
          example: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
        },
        {
          type: "quiz",
          question: "How many apples are there? 🍎🍎🍎",
          options: ["2", "3", "4", "5"],
          correctAnswer: 1,
          explanation: "Count each apple: 1, 2, 3! There are 3 apples.",
        },
        {
          type: "content",
          title: "Adding Numbers",
          content:
            "When we add, we put things together to find out how many in total!",
          example: "2 + 1 = 3 (Two apples plus one apple equals three apples!)",
        },
        {
          type: "quiz",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
          explanation: "2 + 2 = 4! You can count: 1, 2... then 3, 4!",
        },
      ],
    },
    reading: {
      title: "Story Time",
      lessons: [
        {
          type: "content",
          title: "The Alphabet",
          content:
            "Letters make words! Let's start with the first letters: A, B, C, D, E",
          example: "A is for Apple 🍎, B is for Ball ⚽, C is for Cat 🐱",
        },
        {
          type: "quiz",
          question: "What letter does 'Dog' start with?",
          options: ["B", "C", "D", "E"],
          correctAnswer: 2,
          explanation: "Dog starts with the letter D! D-O-G spells Dog 🐕",
        },
      ],
    },
    puzzles: {
      title: "Think & Solve",
      lessons: [
        {
          type: "content",
          title: "What is a Puzzle?",
          content:
            "A puzzle is like a game where we use our brain to find the answer! Thinking step-by-step helps us solve tricky problems.",
          example:
            "Hint: When you are stuck, try thinking about what you know first!",
        },
        {
          type: "content",
          title: "The Missing Sock",
          content:
            "You have 3 red socks and 2 blue socks in a dark drawer. How many socks do you need to pull out to be SURE you have a matching pair?",
          example:
            "Step 1: If you pull 1 sock, it could be red or blue. Step 2: If you pull 2 socks, they might not match (1 red, 1 blue). Step 3: Pull a 3rd sock - now you MUST have a match!",
        },
        {
          type: "quiz",
          question:
            "If you have red and blue socks mixed up, how many do you need to grab to be SURE you have 2 of the same color?",
          options: ["1 sock", "2 socks", "3 socks", "4 socks"],
          correctAnswer: 2,
          explanation:
            "You need 3 socks! The first 2 might be different colors, but the 3rd one MUST match one of them!",
        },
        {
          type: "content",
          title: "Pattern Detective",
          content:
            "Programmers love patterns! Look at this: Circle, Square, Circle, Square, Circle, ??? What comes next?",
          example:
            "Hint: Say the pattern out loud - Circle, Square, Circle, Square... It keeps repeating!",
        },
        {
          type: "quiz",
          question: "What comes next? Star, Heart, Star, Heart, Star, ???",
          options: ["Star", "Heart", "Circle", "Square"],
          correctAnswer: 1,
          explanation:
            "Great job! The pattern is Star, Heart, Star, Heart... so Heart comes next!",
        },
      ],
    },
  },
  "primary-mid": {
    math: {
      title: "Mathematics",
      lessons: [
        {
          type: "content",
          title: "Multiplication Basics",
          content:
            "Multiplication is a quick way to add the same number multiple times.",
          example: "3 × 4 means adding 3 four times: 3 + 3 + 3 + 3 = 12",
        },
        {
          type: "quiz",
          question: "What is 5 × 3?",
          options: ["12", "15", "18", "20"],
          correctAnswer: 1,
          explanation: "5 × 3 = 15. Think of it as 5 + 5 + 5 = 15!",
        },
        {
          type: "content",
          title: "Division Introduction",
          content:
            "Division splits a number into equal groups. It&apos;s the opposite of multiplication.",
          example:
            "12 ÷ 3 = 4 (12 items split into 3 groups gives 4 in each group)",
        },
        {
          type: "quiz",
          question: "What is 20 ÷ 4?",
          options: ["4", "5", "6", "8"],
          correctAnswer: 1,
          explanation:
            "20 ÷ 4 = 5. Twenty split into 4 equal groups gives 5 in each!",
        },
      ],
    },
    science: {
      title: "Science",
      lessons: [
        {
          type: "content",
          title: "The Water Cycle",
          content:
            "Water moves in a cycle: evaporation, condensation, and precipitation.",
          example:
            "Sun heats water → Water rises as vapor → Clouds form → Rain falls!",
        },
        {
          type: "quiz",
          question: "What happens when water is heated by the sun?",
          options: [
            "It freezes",
            "It evaporates",
            "It turns into ice",
            "It disappears",
          ],
          correctAnswer: 1,
          explanation:
            "Water evaporates when heated, turning into water vapor that rises into the air!",
        },
      ],
    },
    puzzles: {
      title: "Logic Puzzles",
      lessons: [
        {
          type: "content",
          title: "Thinking Like a Programmer",
          content:
            "Programmers solve problems by breaking them into smaller steps. This is called an ALGORITHM - a set of instructions to solve a problem!",
          example:
            "Algorithm for making a sandwich: 1) Get bread 2) Add filling 3) Put bread on top 4) Cut in half",
        },
        {
          type: "content",
          title: "The River Crossing Puzzle",
          content:
            "A farmer needs to cross a river with a fox, a chicken, and a bag of grain. The boat only fits the farmer and ONE item. If left alone: the fox eats the chicken, or the chicken eats the grain!",
          example:
            "Step 1: Take the chicken across (fox won&apos;t eat grain). Step 2: Go back alone. Step 3: Take the fox across. Step 4: Bring the chicken BACK. Step 5: Take the grain across. Step 6: Go back and get the chicken!",
        },
        {
          type: "quiz",
          question:
            "In the river crossing puzzle, what should the farmer take FIRST?",
          options: ["The fox", "The grain", "The chicken", "Nothing"],
          correctAnswer: 2,
          explanation:
            "Take the chicken first! If you leave the chicken with the fox, the fox eats it. If you leave the chicken with the grain, it eats the grain. But the fox won&apos;t eat the grain!",
        },
        {
          type: "content",
          title: "The Heavy Ball Puzzle",
          content:
            "You have 9 balls that look the same, but ONE is slightly heavier. You have a balance scale. What&apos;s the FEWEST number of times you need to use the scale to find the heavy ball?",
          example:
            "Hint: Don&apos;t compare one ball at a time! Think about dividing the balls into groups...",
        },
        {
          type: "quiz",
          question:
            "With 9 identical-looking balls (1 heavier) and a balance scale, what&apos;s the minimum number of weighings needed?",
          options: ["4 weighings", "3 weighings", "2 weighings", "1 weighing"],
          correctAnswer: 2,
          explanation:
            "Only 2! Divide into 3 groups of 3. Weigh group 1 vs group 2. If they balance, the heavy ball is in group 3. If not, it&apos;s in the heavier group. Then weigh 2 balls from that group!",
        },
      ],
    },
  },
  "primary-upper": {
    math: {
      title: "Pre-Algebra",
      lessons: [
        {
          type: "content",
          title: "Variables and Expressions",
          content:
            "A variable is a letter that represents an unknown number. We use them in expressions like x + 5.",
          example: "If x = 3, then x + 5 = 3 + 5 = 8",
        },
        {
          type: "quiz",
          question: "If y = 7, what is y + 4?",
          options: ["9", "10", "11", "12"],
          correctAnswer: 2,
          explanation: "If y = 7, then y + 4 = 7 + 4 = 11",
        },
      ],
    },
    coding: {
      title: "Intro to Coding",
      lessons: [
        {
          type: "content",
          title: "What is Code?",
          content:
            "Code is instructions we write for computers. Computers follow these instructions exactly!",
          example:
            'print("Hello, World!") tells the computer to show the words Hello, World!',
        },
        {
          type: "quiz",
          question: "What does code do?",
          options: [
            "Draws pictures",
            "Gives computers instructions",
            "Makes sounds",
            "Plays games",
          ],
          correctAnswer: 1,
          explanation:
            "Code gives computers instructions to follow. Computers do exactly what the code says!",
        },
      ],
    },
    puzzles: {
      title: "Logic & Algorithms",
      lessons: [
        {
          type: "content",
          title: "Introduction to Algorithms",
          content:
            "An algorithm is a step-by-step procedure to solve a problem. Programmers use algorithms to make computers solve complex tasks efficiently.",
          example:
            "Searching for a word in a dictionary: Start in the middle, then go left or right based on alphabetical order - this is called Binary Search!",
        },
        {
          type: "content",
          title: "The Towers of Hanoi",
          content:
            "You have 3 pegs and 3 disks of different sizes stacked on peg A (largest at bottom). Move all disks to peg C. Rules: 1) Move one disk at a time. 2) Never put a larger disk on a smaller one.",
          example:
            "For 3 disks, the minimum moves needed is 7. The pattern: for n disks, you need 2^n - 1 moves!",
        },
        {
          type: "quiz",
          question:
            "In Towers of Hanoi with 2 disks, what is the minimum number of moves?",
          options: ["1 move", "2 moves", "3 moves", "4 moves"],
          correctAnswer: 2,
          explanation:
            "3 moves! Move small disk to B, large disk to C, small disk to C. Formula: 2^2 - 1 = 3",
        },
        {
          type: "content",
          title: "The Locker Problem",
          content:
            "100 lockers in a row, all closed. Person 1 opens every locker. Person 2 closes every 2nd locker. Person 3 changes every 3rd locker (open to closed, or closed to open). This continues for 100 people. Which lockers stay open?",
          example:
            "A locker is toggled once for each of its factors. Locker 12 is toggled by persons 1, 2, 3, 4, 6, 12 (6 times = even = closed). But locker 9 is toggled by 1, 3, 9 (3 times = odd = open!)",
        },
        {
          type: "quiz",
          question: "After 100 people, which lockers remain open?",
          options: [
            "All even numbers",
            "All odd numbers",
            "Perfect squares (1, 4, 9, 16...)",
            "Prime numbers",
          ],
          correctAnswer: 2,
          explanation:
            "Perfect squares! They have an ODD number of factors (9 has factors 1, 3, 9). Only perfect squares have odd factors because one factor is repeated (3 x 3 = 9).",
        },
      ],
    },
  },
  "high-junior": {
    algebra: {
      title: "Algebra",
      lessons: [
        {
          type: "content",
          title: "Solving Linear Equations",
          content:
            "To solve for x, we perform the same operation on both sides of the equation to isolate x.",
          example: "2x + 5 = 13 → 2x = 8 → x = 4",
        },
        {
          type: "quiz",
          question: "Solve for x: 3x - 6 = 15",
          options: ["x = 5", "x = 7", "x = 9", "x = 3"],
          correctAnswer: 1,
          explanation: "3x - 6 = 15 → 3x = 21 → x = 7",
        },
      ],
    },
    biology: {
      title: "Biology",
      lessons: [
        {
          type: "content",
          title: "Cell Structure",
          content:
            "Cells are the basic units of life. They contain organelles like the nucleus, mitochondria, and ribosomes.",
          example:
            "The nucleus contains DNA and controls cell activities. Mitochondria produce energy (ATP).",
        },
        {
          type: "quiz",
          question: "Which organelle is known as the 'powerhouse' of the cell?",
          options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"],
          correctAnswer: 2,
          explanation:
            "Mitochondria are called the powerhouse because they produce ATP, the cell&apos;s energy currency!",
        },
      ],
    },
    puzzles: {
      title: "Computational Thinking",
      lessons: [
        {
          type: "content",
          title: "Decomposition",
          content:
            "Decomposition means breaking a complex problem into smaller, manageable parts. This is one of the four pillars of computational thinking.",
          example:
            "Planning a party: Break it into 1) Guest list 2) Venue 3) Food 4) Entertainment 5) Invitations - each part is easier to handle!",
        },
        {
          type: "content",
          title: "The Monty Hall Problem",
          content:
            "You&apos;re on a game show with 3 doors. Behind one is a car, behind the others are goats. You pick door 1. The host (who knows what&apos;s behind each door) opens door 3, revealing a goat. Should you SWITCH to door 2 or STAY with door 1?",
          example:
            "Intuition says 50/50, but math says SWITCH! Initially you had 1/3 chance. When the host reveals a goat, the 2/3 probability transfers to the other closed door!",
        },
        {
          type: "quiz",
          question:
            "In the Monty Hall problem, what should you do to maximize your chance of winning the car?",
          options: [
            "Stay with your original choice",
            "Switch to the other door",
            "It doesn&apos;t matter - both are 50%",
            "Ask for a hint",
          ],
          correctAnswer: 1,
          explanation:
            "Always SWITCH! Switching wins 2/3 of the time. Your initial pick was 1/3 correct. The host revealing a goat didn&apos;t change that - it concentrated the remaining 2/3 on the other door.",
        },
        {
          type: "content",
          title: "The Prisoners and Hats",
          content:
            "4 prisoners are buried in sand: 3 can see the back of the person ahead, 1 is behind a wall. They wear hats (2 black, 2 white) and can&apos;t see their own. If anyone correctly says their hat color, all go free. They can&apos;t communicate.",
          example:
            "Person 4 sees persons 2 and 3. If 2 and 3 have the same color, person 4 knows theirs is different and speaks. If 4 stays silent, person 3 knows their hat differs from person 2&apos;s!",
        },
        {
          type: "quiz",
          question:
            "In the prisoners and hats puzzle, if person 4 (in back) stays silent, what does person 3 learn?",
          options: [
            "Their hat is black",
            "Their hat is white",
            "Their hat is different from person 2&apos;s",
            "Nothing useful",
          ],
          correctAnswer: 2,
          explanation:
            "If 4 stays silent, they can&apos;t determine their color - meaning persons 2 and 3 have DIFFERENT colors. Person 3 can see person 2&apos;s color, so they know their own is the opposite!",
        },
      ],
    },
  },
  "high-senior": {
    calculus: {
      title: "Calculus",
      lessons: [
        {
          type: "content",
          title: "Introduction to Derivatives",
          content:
            "A derivative measures the rate of change of a function. It tells us how fast something is changing at any point.",
          example:
            "If f(x) = x², then f&apos;(x) = 2x. At x=3, the rate of change is 6.",
        },
        {
          type: "quiz",
          question: "What is the derivative of f(x) = 3x²?",
          options: ["3x", "6x", "x²", "3x³"],
          correctAnswer: 1,
          explanation: "Using the power rule: d/dx(3x²) = 3 · 2x = 6x",
        },
      ],
    },
    physics: {
      title: "Physics",
      lessons: [
        {
          type: "content",
          title: "Newton's Second Law",
          content:
            "Force equals mass times acceleration (F = ma). This fundamental law describes how objects move.",
          example:
            "A 10 kg object accelerating at 2 m/s² experiences a force of 20 N.",
        },
        {
          type: "quiz",
          question: "What force is needed to accelerate a 5 kg mass at 4 m/s²?",
          options: ["9 N", "20 N", "1.25 N", "15 N"],
          correctAnswer: 1,
          explanation: "F = ma = 5 kg × 4 m/s² = 20 N",
        },
      ],
    },
    puzzles: {
      title: "Advanced Logic",
      lessons: [
        {
          type: "content",
          title: "Graph Theory Basics",
          content:
            "Graph theory studies connections. The famous Konigsberg Bridge Problem asked: can you cross all 7 bridges exactly once? Euler proved it&apos;s impossible by analyzing the graph structure.",
          example:
            "A graph has vertices (nodes) and edges (connections). An Eulerian path (crossing each edge once) exists only if 0 or 2 vertices have odd degree (odd number of connections).",
        },
        {
          type: "quiz",
          question:
            "For an Eulerian path to exist (visiting each edge exactly once), how many vertices can have an odd number of edges?",
          options: [
            "Any number",
            "Exactly 0",
            "Exactly 0 or 2",
            "Only even numbers",
          ],
          correctAnswer: 2,
          explanation:
            "Exactly 0 or 2! With 0 odd vertices, you can start anywhere and return. With 2 odd vertices, you start at one and end at the other.",
        },
        {
          type: "content",
          title: "The Blue Eyes Puzzle",
          content:
            "On an island, 100 people have blue eyes and 100 have brown eyes. They can see others&apos; eye colors but not their own. If anyone discovers their own eye color, they must leave at midnight. One day, a visitor says 'I see someone with blue eyes.'",
          example:
            "This is common knowledge in action. With 1 blue-eyed person, they&apos;d leave night 1. With 2, each waits to see if the other leaves night 1; when they don&apos;t, both realize and leave night 2. With n blue-eyed people, all leave on night n!",
        },
        {
          type: "quiz",
          question:
            "If there are 100 blue-eyed people, on which night do they all leave?",
          options: ["Night 1", "Night 50", "Night 99", "Night 100"],
          correctAnswer: 3,
          explanation:
            "Night 100! Each person reasons: 'If there were 99 blue-eyed people, they&apos;d leave on night 99. They didn&apos;t, so there must be 100, which means I have blue eyes too!'",
        },
        {
          type: "content",
          title: "NP-Complete Problems",
          content:
            "Some problems are easy to verify but hard to solve. The Traveling Salesman Problem (TSP) asks: what&apos;s the shortest route visiting all cities exactly once? With n cities, there are (n-1)!/2 possible routes!",
          example:
            "With just 10 cities: 181,440 routes. With 20 cities: over 60 quadrillion routes! This exponential growth makes brute force impractical for large inputs.",
        },
        {
          type: "quiz",
          question:
            "Why can&apos;t we simply check all possible routes in the Traveling Salesman Problem?",
          options: [
            "Routes can&apos;t be compared",
            "The number of routes grows exponentially",
            "Some routes are invalid",
            "Computers can&apos;t calculate distances",
          ],
          correctAnswer: 1,
          explanation:
            "The number of routes grows factorially (even faster than exponentially)! With n cities, there are (n-1)!/2 routes. Even fast computers can&apos;t check them all for large n.",
        },
      ],
    },
  },
};

export default function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ gradeGroup: string; subjectId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { gradeGroup, subjectId } = use(params);
  const urlParams = use(searchParams);
  const router = useRouter();

  // Check for Gemini Live mode - prioritize if available
  const hasGeminiApiKey =
    typeof window !== "undefined" && process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const isGeminiLivePreferred =
    urlParams?.gemini_live !== "false" && urlParams?.gemini_live !== "0";
  const shouldUseGeminiLive =
    hasGeminiApiKey &&
    isGeminiLivePreferred &&
    VOICE_GRADE_GROUPS.has(gradeGroup);

  // Voice mode detection (Gemini Live first, then fallback to standard voice)
  const isVoiceEnabled = VOICE_GRADE_GROUPS.has(gradeGroup);
  const isGeminiLiveMode = shouldUseGeminiLive;

  // State for AI-generated lessons
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheId, setCacheId] = useState<string>("");
  const [startedAt] = useState(() => Date.now());

  // Card-based learning state
  const [useCardBasedLearning, setUseCardBasedLearning] = useState(false);
  const [showCardModeToggle, setShowCardModeToggle] = useState(false);

  // Check if subject supports card-based learning
  const supportsCardLearning = () => {
    const grade = getGradeFromGroup(gradeGroup);
    const cardSupportedSubjects = [
      "math",
      "counting",
      "number-writing",
      "addition-basic",
      "english",
      "phonics",
      "letters",
      "reading",
    ];
    return grade <= 3 && cardSupportedSubjects.includes(subjectId);
  };

  // Voice state (used for fallback when Gemini Live not available)
  const [voiceReady, setVoiceReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const audioRef = useRef<{ contentAudio: any[]; quizAudio: any[] } | null>(
    null
  );

  // Voice lesson hook for recording and echo functionality
  const {
    state: voiceLessonState,
    runEchoSequence,
    playVoiceScript,
    playSoundButton,
    playQuizPrompt,
    playExplanation,
    stop,
  } = useVoiceLesson();

  // Extract state properties for easier access
  const isRecording = voiceLessonState.echoState === "recording";
  const isPlaying = voiceLessonState.isPlaying;
  const transcription = voiceLessonState.transcript;

  // Lesson progress state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Load AI-generated lesson on component mount
  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        setError(null);

        const grade = getGradeFromGroup(gradeGroup);
        const actualSubjectId = getSubjectId(subjectId, grade);

        console.log(
          `🎓 Loading lesson: Grade ${grade}, Route Subject: ${subjectId}, Actual Subject: ${actualSubjectId}`
        );

        const result = await generateLesson(grade, actualSubjectId);
        setLesson(result.lesson);
        setCacheId(result.cacheId);

        // Preload all audio in background for voice-enabled grades
        if (isVoiceEnabled) {
          preloadLessonAudio(result.lesson.steps)
            .then((audio) => {
              audioRef.current = audio;
              setVoiceReady(true);
            })
            .catch(() => setVoiceReady(false));
        }

        // Optional: Show cache status in dev mode
        if (process.env.NODE_ENV === "development") {
          console.log(
            `🎓 Lesson loaded for Grade ${grade} ${actualSubjectId}:`,
            {
              fromCache: result.fromCache,
              cacheId: result.cacheId,
              title: result.lesson.title,
              stepsCount: result.lesson.steps.length,
            }
          );
        }
      } catch (err) {
        console.error("Failed to generate lesson:", err);
        setError(err instanceof Error ? err.message : "Failed to load lesson");

        // Fallback to legacy content if AI fails
        const gradeForFallback = getGradeFromGroup(gradeGroup);
        const actualSubjectForFallback = getSubjectId(
          subjectId,
          gradeForFallback
        );
        const fallback = lessonContent[gradeGroup]?.[actualSubjectForFallback];
        if (fallback) {
          setLesson({
            title: fallback.title,
            cambridgeStage: "Fallback",
            subject: actualSubjectForFallback,
            grade: gradeForFallback,
            estimatedMinutes: 10,
            steps: fallback.lessons.map((l) => ({
              type: l.type,
              title: l.title || l.question || "Step",
              content: l.content || l.question || "",
              example: l.example || l.explanation || "",
              question: l.question || "",
              options: l.options || [],
              correctAnswer: l.correctAnswer || 0,
              explanation: l.explanation || "",
            })),
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [gradeGroup, subjectId]);

  // Check if card-based learning should be offered
  useEffect(() => {
    if (supportsCardLearning()) {
      setShowCardModeToggle(true);
      // Auto-enable for Grade 1 math and english
      const grade = getGradeFromGroup(gradeGroup);
      if (
        grade === 1 &&
        (subjectId === "math" ||
          subjectId === "english" ||
          subjectId === "counting" ||
          subjectId === "phonics")
      ) {
        setUseCardBasedLearning(true);
      }
    }
  }, [gradeGroup, subjectId]);

  // Auto-play voice when step changes and audio is ready
  const speakStep = useCallback(
    async (stepIndex: number) => {
      if (!voiceReady || voiceMuted || !audioRef.current) return;
      const step = lesson?.steps[stepIndex];
      if (!step) return;

      setIsSpeaking(true);
      try {
        if (step.type === "content") {
          const ca = audioRef.current.contentAudio.find(
            (a: any) => a.stepIndex === stepIndex
          );
          if (ca?.voiceScriptAudio) await playBase64Audio(ca.voiceScriptAudio);
          if (ca?.activityAudio) {
            await new Promise((r) => setTimeout(r, 400));
            await playBase64Audio(ca.activityAudio);
          }
          if (ca?.repeatAfterMeClips?.length > 0) {
            for (const clip of ca.repeatAfterMeClips) {
              await new Promise((r) => setTimeout(r, 300));
              await playBase64Audio(clip.audio);
              await new Promise((r) => setTimeout(r, 1500)); // pause for child to echo
            }
          }
        } else {
          const qa = audioRef.current.quizAudio.find(
            (a: any) => a.stepIndex === stepIndex
          );
          if (qa?.voicePromptAudio) await playBase64Audio(qa.voicePromptAudio);
        }
      } finally {
        setIsSpeaking(false);
      }
    },
    [voiceReady, voiceMuted, lesson]
  );

  // Enhanced repeat-after-me with recording
  const runRepeatAfterMeWithRecording = useCallback(
    async (stepIndex: number) => {
      if (!voiceReady || voiceMuted || !audioRef.current) return;
      const step = lesson?.steps[stepIndex];
      if (!step || step.type !== "content") return;

      const ca = audioRef.current.contentAudio.find(
        (a: any) => a.stepIndex === stepIndex
      );

      // Cast to access extra fields from AI-generated content
      const extraFields = step as any;

      if (
        ca?.repeatAfterMeClips?.length > 0 &&
        extraFields.repeatAfterMe?.length > 0
      ) {
        setIsSpeaking(true);
        try {
          // Use the voice lesson hook's echo sequence functionality
          const clips = ca.repeatAfterMeClips.map((clip: any) => ({
            text: clip.text,
            audio: clip.audio,
            pauseAfterMs: 2000, // 2 seconds for child to respond
          }));

          // Create listenFor arrays - each phrase has multiple accepted variations
          const listenFor = extraFields.repeatAfterMe.map((phrase: string) => [
            phrase.toLowerCase(),
            phrase.toLowerCase().replace(/[.,!?]/g, ""), // without punctuation
            phrase.split(" ")[0].toLowerCase(), // first word only
          ]);

          await runEchoSequence(clips, listenFor, () => {
            console.log("Repeat-after-me sequence completed!");
            setXpEarned((prev) => prev + 5); // Bonus XP for voice interaction
          });
        } finally {
          setIsSpeaking(false);
        }
      }
    },
    [voiceReady, voiceMuted, lesson, runEchoSequence, setXpEarned]
  );

  const speakExplanation = useCallback(
    async (stepIndex: number) => {
      if (!voiceReady || voiceMuted || !audioRef.current) return;
      const qa = audioRef.current.quizAudio.find(
        (a: any) => a.stepIndex === stepIndex
      );
      if (qa?.voiceExplanationAudio) {
        setIsSpeaking(true);
        await playBase64Audio(qa.voiceExplanationAudio).finally(() =>
          setIsSpeaking(false)
        );
      }
    },
    [voiceReady, voiceMuted]
  );

  useEffect(() => {
    if (voiceReady && lesson) speakStep(currentStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceReady, currentStep]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-primary animate-pulse mr-3" />
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Generating Your Lesson</h2>
          <p className="text-muted-foreground">
            AI is creating a personalized {subjectId} lesson for {gradeGroup}...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-600">
              Powered by Cambridge Curriculum
            </span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  // No lesson available
  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <Lightbulb className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Lesson Coming Soon!</h2>
          <p className="text-muted-foreground mb-4">
            We're working on {subjectId} content for {gradeGroup}. Check back
            later!
          </p>
          <Button onClick={() => router.push(`/playground/${gradeGroup}`)}>
            Back to Playground
          </Button>
        </Card>
      </div>
    );
  }

  // Main lesson logic
  const steps = lesson.steps;
  const currentLesson = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  // extra fields Claude returns (not in base type)
  const extra = currentLesson as Record<string, unknown>;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (
      currentLesson.type === "quiz" &&
      selectedAnswer === currentLesson.correctAnswer
    ) {
      setCorrectAnswers((prev) => prev + 1);
      setXpEarned((prev) => prev + 10);
    }
    speakExplanation(currentStep);
  };

  const handleNext = () => {
    if (isLastStep) {
      // Complete lesson - navigate to results
      router.push(
        `/playground/${gradeGroup}/lesson/${subjectId}/results?correct=${correctAnswers}&total=${
          steps.filter((l) => l.type === "quiz").length
        }&xp=${xpEarned}&cacheId=${cacheId}&duration=${Math.round(
          (Date.now() - startedAt) / 1000
        )}`
      );
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleBack = () => {
    router.push(`/playground/${gradeGroup}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
            <div className="text-center">
              <h1 className="font-bold text-foreground">{lesson.title}</h1>
              <p className="text-xs text-muted-foreground">
                {lesson.cambridgeStage} • Grade {lesson.grade} • ~
                {lesson.estimatedMinutes} min
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isVoiceEnabled && (
                <>
                  {/* Voice Mode Toggle */}
                  {hasGeminiApiKey && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newUrl = new URL(window.location.href);
                        if (isGeminiLiveMode) {
                          newUrl.searchParams.set("gemini_live", "false");
                        } else {
                          newUrl.searchParams.delete("gemini_live");
                        }
                        window.location.href = newUrl.toString();
                      }}
                      className="text-xs"
                      title={
                        isGeminiLiveMode
                          ? "Switch to Standard Voice"
                          : "Switch to Gemini Live AI"
                      }
                    >
                      {isGeminiLiveMode ? "🎤 Standard" : "🤖 AI Live"}
                    </Button>
                  )}

                  {/* Voice Mute Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isSpeaking) return;
                      setVoiceMuted((m) => !m);
                    }}
                    className="text-muted-foreground"
                    title={voiceMuted ? "Unmute voice" : "Mute voice"}
                  >
                    {voiceMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                </>
              )}

              {/* Card Mode Toggle */}
              {showCardModeToggle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseCardBasedLearning(!useCardBasedLearning)}
                  className="text-xs"
                  title={
                    useCardBasedLearning
                      ? "Switch to Standard Lesson"
                      : "Switch to Interactive Cards"
                  }
                >
                  {useCardBasedLearning ? "📄 Standard" : "🎴 Cards"}
                </Button>
              )}
              <div className="flex items-center gap-2 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold">+{xpEarned} XP</span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {currentStep + 1} of {steps.length}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Gemini Live Voice Assistant Mode (Primary) */}
        {isGeminiLiveMode && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-purple-700 font-medium">
                  🎯 Gemini Live AI Tutor Active
                </span>
                <span className="text-purple-600 text-sm">
                  (Real-time conversation)
                </span>
              </div>
            </div>
            <GeminiLiveSession
              childProfile={{
                name: "Student", // You can get this from user data
                age: getGradeFromGroup(gradeGroup) + 4, // Grade 1 = age 5, etc.
                grade: getGradeFromGroup(gradeGroup),
                interests: [subjectId], // Current subject as interest
                learningStyle: "visual", // Default, could be user preference
                strugglingWith: [],
                excelsAt: [],
                currentTopic: subjectId,
              }}
              lessonSubject={subjectId}
              onSessionEnd={(summary) => {
                console.log("Gemini Live session completed:", summary);
                // Update XP based on engagement and concepts learned
                const sessionXP = Math.round(
                  summary.engagement * summary.concepts_learned.length * 10
                );
                setXpEarned((prev) => prev + sessionXP);
                // Move to next step or complete lesson
                handleNext();
              }}
            />
          </div>
        )}

        {/* Standard Voice Lessons (Fallback when Gemini Live unavailable) */}
        {!isGeminiLiveMode && isVoiceEnabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700 font-medium">
                🎤 Standard Voice Mode
              </span>
              <span className="text-blue-600 text-sm">
                (Pre-recorded responses)
              </span>
            </div>
          </div>
        )}

        {/* Card-Based Learning Mode */}
        {!isGeminiLiveMode && useCardBasedLearning && (
          <CardLessonRenderer
            grade={getGradeFromGroup(gradeGroup) as 1 | 2 | 3}
            subjectId={subjectId}
            onComplete={() => {
              // Award XP for completing card lesson
              setXpEarned((prev) => prev + 50);
              // Move to results or next lesson
              router.push(
                `/playground/${gradeGroup}/lesson/${subjectId}/results?xp=${
                  xpEarned + 50
                }&card=true`
              );
            }}
            onBack={handleBack}
          />
        )}

        {/* Standard Lesson Content (when cards are disabled) */}
        {!isGeminiLiveMode && !useCardBasedLearning && (
          <>
            {currentLesson.type === "content" ? (
              <Card className="p-8">
                {/* Speaking/Recording indicator */}
                {(isSpeaking || isRecording || isPlaying) && (
                  <div className="flex items-center gap-2 text-primary mb-4 text-sm">
                    {isSpeaking && (
                      <>
                        <Volume2 className="h-4 w-4 animate-pulse" />
                        <span>Speaking...</span>
                      </>
                    )}
                    {isRecording && (
                      <>
                        <Mic className="h-4 w-4 animate-pulse text-red-500" />
                        <span className="text-red-600">
                          Recording your voice...
                        </span>
                      </>
                    )}
                    {isPlaying && (
                      <>
                        <Volume2 className="h-4 w-4 animate-pulse" />
                        <span>Playing back...</span>
                      </>
                    )}
                  </div>
                )}

                {/* Transcription feedback */}
                {transcription && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-semibold">Great job! I heard:</span>
                    </div>
                    <p className="text-green-800 font-medium">
                      "{transcription}"
                    </p>
                  </div>
                )}

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {(currentLesson as any).title}
                </h2>

                <p className="text-lg text-foreground leading-relaxed mb-6">
                  {(currentLesson as any).content}
                </p>

                {(currentLesson as any).example && (
                  <div className="bg-primary/10 rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-2 text-primary mb-3">
                      <Lightbulb className="h-5 w-5" />
                      <span className="font-semibold">Example</span>
                    </div>
                    <p className="text-foreground font-medium">
                      {(currentLesson as any).example}
                    </p>
                  </div>
                )}

                {/* Activity prompt — shown for all subjects */}
                {extra.activityPrompt && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <Hand className="h-5 w-5" />
                      <span className="font-semibold">Try it now!</span>
                    </div>
                    <p className="text-amber-900 font-medium">
                      {extra.activityPrompt as string}
                    </p>
                  </div>
                )}

                {/* Subject-specific fact */}
                {(extra.scienceFact ??
                  extra.musicFact ??
                  extra.codingFact ??
                  extra.worldFact) && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-semibold">Wow fact! 🤩</span>
                    </div>
                    <p className="text-purple-900 text-sm">
                      {
                        (extra.scienceFact ??
                          extra.musicFact ??
                          extra.codingFact ??
                          extra.worldFact) as string
                      }
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {isVoiceEnabled && voiceReady && (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => speakStep(currentStep)}
                        disabled={isSpeaking}
                        className="shrink-0"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                      {/* Talk-Back button for repeat-after-me with recording */}
                      {extra.repeatAfterMe &&
                        Array.isArray(extra.repeatAfterMe) &&
                        extra.repeatAfterMe.length > 0 && (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() =>
                              runRepeatAfterMeWithRecording(currentStep)
                            }
                            disabled={isSpeaking || isRecording}
                            className="shrink-0 bg-blue-50 border-blue-200 hover:bg-blue-100"
                            title="Practice saying the words!"
                          >
                            {isRecording ? (
                              <MicOff className="h-5 w-5 text-red-500" />
                            ) : (
                              <Mic className="h-5 w-5 text-blue-600" />
                            )}
                          </Button>
                        )}
                    </>
                  )}
                  <Button size="lg" className="w-full" onClick={handleNext}>
                    {isLastStep ? "Complete Lesson" : "Continue"}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </Card>
            ) : (
              /* Quiz View */
              (() => {
                const quizStep = currentLesson as QuizStep;
                return (
                  <Card className="p-8">
                    {/* Speaking/Recording indicator */}
                    {(isSpeaking || isRecording || isPlaying) && (
                      <div className="flex items-center gap-2 text-primary mb-4 text-sm">
                        {isSpeaking && (
                          <>
                            <Volume2 className="h-4 w-4 animate-pulse" />
                            <span>Speaking...</span>
                          </>
                        )}
                        {isRecording && (
                          <>
                            <Mic className="h-4 w-4 animate-pulse text-red-500" />
                            <span className="text-red-600">
                              Recording your answer...
                            </span>
                          </>
                        )}
                        {isPlaying && (
                          <>
                            <Volume2 className="h-4 w-4 animate-pulse" />
                            <span>Playing back...</span>
                          </>
                        )}
                      </div>
                    )}

                    <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                      {quizStep.question}
                    </h2>

                    {/* Transcription feedback for quiz */}
                    {transcription && !showResult && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <Mic className="h-4 w-4" />
                          <span className="font-semibold">
                            I heard you say:
                          </span>
                        </div>
                        <p className="text-blue-800 font-medium">
                          "{transcription}"
                        </p>
                        <p className="text-blue-600 text-sm mt-2">
                          Click on the matching answer or speak again!
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 mb-8">
                      {quizStep.options?.map((option, index) => {
                        let buttonStyle =
                          "border-2 border-border bg-card hover:border-primary hover:bg-accent";

                        if (showResult) {
                          if (index === quizStep.correctAnswer) {
                            buttonStyle =
                              "border-2 border-green-500 bg-green-50 text-green-700";
                          } else if (
                            index === selectedAnswer &&
                            selectedAnswer !== quizStep.correctAnswer
                          ) {
                            buttonStyle =
                              "border-2 border-red-500 bg-red-50 text-red-700";
                          }
                        } else if (selectedAnswer === index) {
                          buttonStyle = "border-2 border-primary bg-primary/10";
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={showResult}
                            className={`w-full p-4 rounded-xl text-left text-lg font-medium transition-all ${buttonStyle}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {showResult &&
                                index === quizStep.correctAnswer && (
                                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                                )}
                              {showResult &&
                                index === selectedAnswer &&
                                selectedAnswer !== quizStep.correctAnswer && (
                                  <XCircle className="h-6 w-6 text-red-500" />
                                )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {showResult && quizStep.explanation && (
                      <div
                        className={`rounded-xl p-4 mb-6 ${
                          selectedAnswer === quizStep.correctAnswer
                            ? "bg-green-50 border border-green-200"
                            : "bg-amber-50 border border-amber-200"
                        }`}
                      >
                        <p className="text-foreground">
                          {quizStep.explanation}
                        </p>
                      </div>
                    )}

                    {quizStep.hint &&
                      !showResult &&
                      selectedAnswer !== null && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                          <div className="flex items-center gap-2 text-blue-700 mb-2">
                            <Lightbulb className="h-4 w-4" />
                            <span className="font-semibold">Hint</span>
                          </div>
                          <p className="text-blue-800">{quizStep.hint}</p>
                        </div>
                      )}

                    {!showResult ? (
                      <div className="flex gap-3">
                        {isVoiceEnabled && voiceReady && (
                          <>
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => speakStep(currentStep)}
                              disabled={isSpeaking}
                              className="shrink-0"
                            >
                              <Volume2 className="h-5 w-5" />
                            </Button>
                            {/* Voice answer button for quiz */}
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => {
                                // Simple implementation: trigger a voice recording session
                                setIsSpeaking(true);
                                setTimeout(() => setIsSpeaking(false), 3000);
                                // TODO: Implement voice answer matching logic
                                console.log("Voice answer recording triggered");
                              }}
                              disabled={isSpeaking}
                              className="shrink-0 bg-blue-50 border-blue-200 hover:bg-blue-100"
                              title="Record your answer"
                            >
                              {isSpeaking ? (
                                <MicOff className="h-5 w-5 text-red-500" />
                              ) : (
                                <Mic className="h-5 w-5 text-blue-600" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={handleCheckAnswer}
                          disabled={selectedAnswer === null}
                        >
                          Check Answer
                        </Button>
                      </div>
                    ) : (
                      <Button size="lg" className="w-full" onClick={handleNext}>
                        {isLastStep ? "See Results" : "Continue"}
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    )}
                  </Card>
                );
              })()
            )}
          </>
        )}
      </main>
    </div>
  );
}
