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

    const { mediaId } = await request.json()
    const userId = session.user.id

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 })
    }

    // Update the media assignment
    await sql`
      UPDATE media_assignment
      SET watched = true, "watchedAt" = NOW(), "updatedAt" = NOW()
      WHERE "mediaId" = ${mediaId} AND "studentId" = ${userId}
    `

    // Invalidate cache
    await redis.del(cacheKeys.userMedia(userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking video as watched:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
