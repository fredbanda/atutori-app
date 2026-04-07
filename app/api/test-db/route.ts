import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const grade = parseInt(searchParams.get("grade") || "1");
  const subjectId = searchParams.get("subjectId") || "counting";
  const version = parseInt(searchParams.get("version") || "1");

  try {
    console.log(
      `🔍 Testing database query: grade=${grade}, subjectId=${subjectId}, version=${version}`
    );

    // Test the exact query from generateLesson
    const prompt = await prisma.subjectPrompt.findFirst({
      where: { subjectId, grade, version, isActive: true },
      select: {
        id: true,
        subjectId: true,
        subjectName: true,
        grade: true,
        version: true,
        topicFocus: true,
        systemPrompt: true,
        userPrompt: true,
      },
    });

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: `No active prompt for grade ${grade} subject "${subjectId}" version ${version}`,
        },
        { status: 404 }
      );
    }

    // Test next prompt query
    const nextPrompt = await prisma.subjectPrompt.findFirst({
      where: { subjectId, grade, version: version + 1, isActive: true },
      select: { version: true },
    });

    console.log(`✅ Found prompt:`, {
      id: prompt.id,
      subjectId: prompt.subjectId,
      version: prompt.version,
      hasNext: !!nextPrompt,
    });

    return NextResponse.json({
      success: true,
      prompt: {
        id: prompt.id,
        subjectId: prompt.subjectId,
        subjectName: prompt.subjectName,
        grade: prompt.grade,
        version: prompt.version,
        topicFocus: prompt.topicFocus,
        systemPromptLength: prompt.systemPrompt?.length || 0,
        userPromptLength: prompt.userPrompt?.length || 0,
      },
      isLastLesson: !nextPrompt,
      nextVersion: nextPrompt ? version + 1 : null,
    });
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
