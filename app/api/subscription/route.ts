import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Try cache first
    const cacheKey = CACHE_KEYS.subscription(userId)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json({ subscription: JSON.parse(cached), fromCache: true })
    }

    // Fetch from database
    const subscriptions = await sql`
      SELECT 
        s.id,
        s.status,
        s."currentPeriodStart",
        s."currentPeriodEnd",
        p.name as "packageName",
        p.price,
        p.interval,
        p."maxStudents"
      FROM subscription s
      JOIN package p ON p.id = s."packageId"
      WHERE s."userId" = ${userId}
      AND s.status = 'active'
      ORDER BY s."createdAt" DESC
      LIMIT 1
    `

    const subscription = subscriptions[0] || null

    // Cache the result
    if (subscription) {
      await redis.set(cacheKey, JSON.stringify(subscription), "EX", CACHE_TTL.subscription)
    }

    return NextResponse.json({ subscription, fromCache: false })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
  }
}
