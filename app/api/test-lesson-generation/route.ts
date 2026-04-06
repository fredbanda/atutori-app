import { NextRequest, NextResponse } from "next/server";
import { generateLesson } from "@/lib/generate-lesson";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gradeGroup = searchParams.get("gradeGroup") || "primary-early";
  const subjectId = searchParams.get("subjectId") || "math";
  const userId = searchParams.get("userId") || "test-user-api";
  const gradeParam = searchParams.get("grade");

  try {
    console.log(
      `🧪 API Test: Generating lesson for ${gradeGroup}, subject ${subjectId}`
    );

    // Get grade from grade group or use specified grade
    let grade: number;
    if (gradeParam) {
      grade = parseInt(gradeParam);
      console.log(`📚 Using specified grade ${grade}`);
    } else {
      const gradeGroupToGrade = {
        "primary-early": [1, 2, 3],
        "primary-mid": [4, 5, 6],
        "primary-upper": [7, 8],
        "high-junior": [9, 10],
        "high-senior": [11, 12],
      };

      const grades =
        gradeGroupToGrade[gradeGroup as keyof typeof gradeGroupToGrade];
      grade = grades ? grades[0] : 1; // Use first grade instead of middle
      console.log(`📚 Using first grade ${grade} from group ${gradeGroup}`);
    }

    console.log(`📚 Using grade ${grade} for group ${gradeGroup}`);

    // Apply subject mapping for proper Grade 1 curriculum
    const subjectMapping = {
      1: {
        "1": "counting",
        "2": "number-writing", 
        "3": "addition-basic",
        "4": "subtraction-basic",
        "5": "shapes-patterns",
        "6": "measurement-comparison",
        "7": "time-sequencing",
        "8": "money-basics",
        "math": "counting", // Legacy fallback
      },
      2: {
        "math": "math", // Direct mapping for Grade 2
      },
    };

    function getActualSubjectId(routeSubjectId: string, grade: number): string {
      const mapping = subjectMapping[grade as keyof typeof subjectMapping];
      return mapping?.[routeSubjectId as keyof typeof mapping] || routeSubjectId;
    }

    const actualSubjectId = getActualSubjectId(subjectId, grade);
    console.log(`🔄 Subject mapping: ${subjectId} → ${actualSubjectId} for Grade ${grade}`);

    const startTime = Date.now();
    const result = await generateLesson(grade, actualSubjectId);
    const endTime = Date.now();

    console.log(`✅ Lesson generation successful in ${endTime - startTime}ms`);

    return NextResponse.json({
      success: true,
      duration: endTime - startTime,
      fromCache: result.fromCache,
      cacheId: result.cacheId,
      lesson: {
        title: result.lesson.title,
        subject: result.lesson.subject,
        grade: result.lesson.grade,
        cambridgeStage: result.lesson.cambridgeStage,
        estimatedMinutes: result.lesson.estimatedMinutes,
        stepsCount: result.lesson.steps.length,
        // Include first step as preview
        firstStep: result.lesson.steps[0] || null,
      },
    });
  } catch (error) {
    console.error("❌ API Test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gradeGroup, subjectId = "math", forceRegenerate = false } = body;
    let { grade } = body;

    console.log(
      `🧪 POST API Test: Generating lesson for ${gradeGroup}, subject ${subjectId}`,
      {
        forceRegenerate,
        grade,
      }
    );

    // Get grade from grade group if not specified
    if (!grade) {
      const gradeGroupToGrade = {
        "primary-early": [1, 2, 3],
        "primary-mid": [4, 5, 6],
        "primary-upper": [7, 8],
        "high-junior": [9, 10],
        "high-senior": [11, 12],
      };

      const grades =
        gradeGroupToGrade[gradeGroup as keyof typeof gradeGroupToGrade];
      grade = grades ? grades[0] : 1; // Use first grade
    }

    const startTime = Date.now();
    const result = await generateLesson(grade, subjectId, forceRegenerate);
    const endTime = Date.now();

    console.log(
      `✅ POST: Lesson generation successful in ${endTime - startTime}ms`
    );

    return NextResponse.json({
      success: true,
      duration: endTime - startTime,
      fromCache: result.fromCache,
      cacheId: result.cacheId,
      lesson: result.lesson,
    });
  } catch (error) {
    console.error("❌ POST API Test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
