import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redis, cacheKeys, CACHE_TTL } from "@/lib/redis"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Try to get from cache first
    const cacheKey = cacheKeys.userMedia(userId)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json({ media: cached, fromCache: true })
    }

    // Fetch assigned media for this student
    const media = await sql`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.url,
        m."thumbnailUrl",
        m.duration,
        m."gradeGroup",
        m."subjectId",
        ma.watched,
        ma."watchedAt",
        ma."quizCompleted",
        ma."quizScore",
        ma."assignedById",
        ma."createdAt" as "assignedAt"
      FROM media_assignment ma
      JOIN media m ON m.id = ma."mediaId"
      WHERE ma."studentId" = ${userId}
      ORDER BY ma."createdAt" DESC
    `

    // Cache for 5 minutes
    await redis.set(cacheKey, media, { ex: CACHE_TTL.MEDIUM })

    return NextResponse.json({ media, fromCache: false })
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}
