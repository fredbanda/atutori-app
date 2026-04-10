// app/api/admin/voice-health/route.ts
// Real-time monitoring dashboard for voice services
// Production-ready health checks and performance metrics

import { NextResponse } from "next/server";
import {
  getVoiceSystemHealth,
  triggerServiceRecovery,
} from "@/lib/services/bulletproof-voice";
import { voiceHealthMonitor } from "@/lib/monitoring/voice-health";

export async function GET() {
  try {
    const health = await getVoiceSystemHealth();

    return NextResponse.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === "recovery") {
      const result = await triggerServiceRecovery();

      return NextResponse.json({
        success: true,
        message: "Service recovery initiated",
        data: result,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "recent-errors") {
      const errors = voiceHealthMonitor.getRecentErrors(20);

      return NextResponse.json({
        success: true,
        data: { errors },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unknown action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin action failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Action failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
