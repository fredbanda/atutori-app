import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redis, cacheKeys } from "@/lib/redis"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId, score } = await request.json()
    const userId = session.user.id

    if (!mediaId || score === undefined) {
      return NextResponse.json({ error: "Media ID and score required" }, { status: 400 })
    }

    // Update the media assignment with quiz score
    await sql`
      UPDATE media_assignment
      SET 
        "quizCompleted" = true, 
        "quizScore" = ${score},
        "updatedAt" = NOW()
      WHERE "mediaId" = ${mediaId} AND "studentId" = ${userId}
    `

    // Award XP based on score
    const xpEarned = Math.round(score * 0.5) // 50 XP for 100% score
    await sql`
      UPDATE "user"
      SET xp = xp + ${xpEarned}, "updatedAt" = NOW()
      WHERE id = ${userId}
    `

    // Invalidate caches
    await redis.del(cacheKeys.userMedia(userId))
    await redis.del(cacheKeys.userProgress(userId))

    return NextResponse.json({ success: true, xpEarned })
  } catch (error) {
    console.error("Error saving quiz score:", error)
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
  }
}
