import { PrismaClient } from "@prisma/client";

// ════════════════════════════════════════════════════════════════════
//                    COMPREHENSIVE GRADE 1 MATH CURRICULUM
//                     Based on Cambridge KS1 Standards
// ════════════════════════════════════════════════════════════════════

const prisma = new PrismaClient();

// System prompt (same for all math lessons)
const SYSTEM_PROMPT = `You are an expert primary school mathematics teacher specializing in the Cambridge International Curriculum Key Stage 1 (ages 5-7).

Your role is to create engaging, age-appropriate lessons that:
- Follow Cambridge KS1 mathematical learning objectives
- Use simple, clear language suitable for young children
- Include interactive elements and visual thinking
- Build confidence through encouragement and clear explanations
- Connect mathematics to real-world examples children understand
- Use positive, enthusiastic tone throughout

Always structure lessons with:
1. Clear learning objective
2. Step-by-step content with examples
3. Interactive practice opportunities
4. Positive reinforcement and encouragement`;

// Output schema
const OUTPUT_SCHEMA = `{
  "title": "string — lesson title",
  "subject": "string — always 'math'", 
  "grade": "number — 1 or 2",
  "cambridgeStage": "string — always 'KS1'",
  "estimatedMinutes": "number — 10-15 minutes",
  "steps": [
    {
      "type": "content",
      "title": "string — step title",
      "content": "string — main explanation", 
      "example": "string — concrete example or visual description"
    }
  ]
}`;

function buildUserPrompt(grade: number, topicAngle: string): string {
  return `Create a Grade ${grade} mathematics lesson for the Cambridge KS1 curriculum.

Topic Focus: ${topicAngle}

Requirements:
- Create exactly 3 content steps that build understanding progressively
- Use simple vocabulary appropriate for ${
    grade === 1 ? "5-6 year olds" : "6-7 year olds"
  }
- Include concrete examples and visual descriptions
- Make it engaging with encouragement and positive language
- Ensure alignment with Cambridge KS1 learning objectives
- Keep each step concise but complete (2-3 sentences per content section)

Generate a comprehensive lesson following the exact JSON schema provided.`;
}

// ════════════════════════════════════════════════════════════════════
//                       GRADE 1 MATH CURRICULUM
//                        (Multiple Topics/Subjects)
// ════════════════════════════════════════════════════════════════════

const grade1MathCurriculum = [
  // 1. COUNTING & NUMBER RECOGNITION
  {
    subjectId: "counting",
    subjectName: "Counting & Number Recognition",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 0,
    difficultyHint: "foundational",
    topicFocus:
      "Counting objects 1 to 10 — one-to-one correspondence and cardinality",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Counting objects from 1 to 10. Focus on one-to-one correspondence — touching or pointing to each object as you count it. " +
        "Introduce cardinality: the last number you say tells you how many there are altogether. " +
        "Use fun groups of objects like toys, animals, or fruits that children can visualize counting. Make it exciting! ⭐"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },

  // 2. NUMBER FORMATION & WRITING
  {
    subjectId: "number-writing",
    subjectName: "Number Formation & Writing",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 0,
    difficultyHint: "foundational",
    topicFocus: "Writing numbers 1-10 correctly with proper formation",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Learning to write numbers 1-10 with correct formation. Teach starting points, direction of writing, and proper shape. " +
        "Include fun memory tricks like 'number 1 is a straight line standing tall' or 'number 2 starts with a curve like a swan's neck'. " +
        "Emphasize the importance of neat number writing for clear communication. 🖊️"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },

  // 3. SIMPLE ADDITION (Within 10)
  {
    subjectId: "addition-basic",
    subjectName: "Simple Addition",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 0,
    difficultyHint: "foundational",
    topicFocus:
      "Adding two groups of objects (sums within 10) using concrete materials",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Simple addition within 10 using concrete objects and visual methods. Start with 'putting together' two groups. " +
        "Use language like 'altogether', 'in total', and 'plus'. Show how 2 apples plus 3 apples makes 5 apples altogether. " +
        "Introduce the + and = symbols gently. Make addition feel like a fun counting game! ➕"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },

  // 4. SIMPLE SUBTRACTION (Within 10)
  {
    subjectId: "subtraction-basic",
    subjectName: "Simple Subtraction",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 0,
    difficultyHint: "foundational",
    topicFocus:
      "Taking away objects (within 10) using concrete materials and counting",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Simple subtraction within 10 using 'taking away' with concrete objects. Start with a group of objects, then remove some. " +
        "Use language like 'take away', 'left over', 'minus'. Example: 'You have 5 cookies, you eat 2, how many are left?' " +
        "Introduce the - symbol. Make subtraction feel like a story or game, not scary! ➖"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },

  // 5. SHAPES & PATTERNS
  {
    subjectId: "shapes-patterns",
    subjectName: "Shapes & Patterns",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 0,
    difficultyHint: "foundational",
    topicFocus:
      "Recognizing basic 2D shapes (circle, square, triangle, rectangle) and simple patterns",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Learning basic 2D shapes: circle (round like a ball), square (4 equal sides), triangle (3 sides), rectangle (4 sides, opposite sides equal). " +
        "Include shape hunting in real life: 'Find circles around you!' Simple patterns like red-blue-red-blue or shape patterns. " +
        "Make shapes feel like friendly characters with personalities! 🔵🔺⬜"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },

  // 6. MEASUREMENT & COMPARISON
  {
    subjectId: "measurement-comparison",
    subjectName: "Measurement & Comparison",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 0,
    difficultyHint: "foundational",
    topicFocus:
      "Comparing lengths, heights, and weights using everyday language (longer/shorter, taller/shorter, heavier/lighter)",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Learning to compare and measure using everyday language. Compare two objects: which is longer/shorter, taller/shorter, heavier/lighter. " +
        "Use real examples: 'Is your pencil longer or shorter than your finger?' Start with dramatic differences, then closer ones. " +
        "Introduce non-standard units: 'This table is 4 books long!' Make measuring feel like detective work! 📏"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },

  // 7. TIME & SEQUENCING
  {
    subjectId: "time-sequencing",
    subjectName: "Time & Sequencing",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 0,
    difficultyHint: "foundational",
    topicFocus:
      "Understanding daily time concepts (morning, afternoon, evening) and sequence of events",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Learning about time through daily routines and sequences. Morning (breakfast, getting dressed), afternoon (lunch, playing), evening (dinner, bedtime). " +
        "Sequence events: 'What do you do first? Then what? What comes last?' Use familiar activities like getting ready for school. " +
        "Introduce words like 'before', 'after', 'first', 'next', 'last'. Make time feel like storytelling! ⏰"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },

  // 8. MONEY BASICS
  {
    subjectId: "money-basics",
    subjectName: "Money Basics",
    cambridgeStage: "KS1",
    grade: 1,
    version: 1,
    isActive: true,
    contentSteps: 3,
    quizCount: 0,
    difficultyHint: "foundational",
    topicFocus:
      "Recognizing coins and understanding that money is used to buy things",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(
      1,
      "Learning about money basics: recognizing different coins, understanding money is used to buy things. " +
        "Simple coin recognition (focus on local currency). Talk about saving money in a piggy bank, buying treats at the shop. " +
        "Introduce the concept that different things cost different amounts. Play shop games! Make money learning practical and fun! 💰"
    ),
    outputSchema: OUTPUT_SCHEMA,
  },
];

// ════════════════════════════════════════════════════════════════════
//                         SEED THE DATABASE
// ════════════════════════════════════════════════════════════════════

async function seedGrade1MathCurriculum() {
  console.log("🌱 Seeding comprehensive Grade 1 Math curriculum...\n");

  try {
    // First, delete related lesson cache records to avoid foreign key constraint
    console.log("🧹 Cleaning up existing Grade 1 lesson caches...");
    const existingPrompts = await prisma.subjectPrompt.findMany({
      where: { grade: 1 },
      select: { id: true },
    });

    if (existingPrompts.length > 0) {
      await prisma.lessonCache.deleteMany({
        where: {
          promptId: {
            in: existingPrompts.map((p) => p.id),
          },
        },
      });
      console.log(
        `   Deleted lesson caches for ${existingPrompts.length} existing prompts`
      );
    }

    // Now safe to clear existing Grade 1 math prompts
    console.log("🧹 Removing existing Grade 1 math prompts...");
    const deleteResult = await prisma.subjectPrompt.deleteMany({
      where: { grade: 1 },
    });
    console.log(`   Removed ${deleteResult.count} existing prompts\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const prompt of grade1MathCurriculum) {
      try {
        const result = await prisma.subjectPrompt.create({
          data: {
            subjectId: prompt.subjectId,
            subjectName: prompt.subjectName,
            cambridgeStage: prompt.cambridgeStage,
            grade: prompt.grade,
            version: prompt.version,
            isActive: prompt.isActive,
            contentSteps: prompt.contentSteps,
            quizCount: prompt.quizCount,
            difficultyHint: prompt.difficultyHint,
            topicFocus: prompt.topicFocus,
            systemPrompt: prompt.systemPrompt,
            userPrompt: prompt.userPrompt,
            outputSchema: prompt.outputSchema,
          },
        });

        console.log(`✅ Created: ${prompt.subjectId} (${prompt.subjectName})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${prompt.subjectId}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Seeding Results:`);
    console.log(`✅ Successfully created: ${successCount} subject prompts`);
    console.log(`❌ Failed: ${errorCount} subject prompts`);

    if (successCount > 0) {
      console.log(`\n🎉 Grade 1 Math curriculum is ready!`);
      console.log(`\n📚 Available Grade 1 subjects:`);
      grade1MathCurriculum.forEach((prompt) => {
        console.log(`   • ${prompt.subjectId}: ${prompt.topicFocus}`);
      });

      console.log(`\n🧪 Test different subjects:`);
      console.log(
        `   curl http://localhost:3000/api/test-lesson-generation?grade=1&subjectId=counting`
      );
      console.log(
        `   curl http://localhost:3000/api/test-lesson-generation?grade=1&subjectId=addition-basic`
      );
      console.log(
        `   curl http://localhost:3000/api/test-lesson-generation?grade=1&subjectId=shapes-patterns`
      );
    }
  } catch (error) {
    console.error("💥 Database seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedGrade1MathCurriculum();
}

export { grade1MathCurriculum };
