import { NextRequest, NextResponse } from "next/server";
import { speakText } from "@/lib/actions/voice";

export async function POST(request: NextRequest) {
  try {
    const { text, speed = 0.85 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const result = await speakText(text, speed);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Voice API error:", error);

    // Get text safely from request body
    let fallbackText = "Sorry, voice is not available right now";
    try {
      const body = await request.clone().json();
      fallbackText = body.text || fallbackText;
    } catch {
      // If we can't parse the request, use default fallback
    }

    return NextResponse.json(
      {
        error: "Voice generation failed",
        audio: "",
        durationHint: 3000,
        fallbackText,
        useBrowserTTS: true,
      },
      { status: 500 }
    );
  }
}
