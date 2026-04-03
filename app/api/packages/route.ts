import { NextResponse } from "next/server"
import { redis, CACHE_TTL } from "@/lib/redis"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Try cache first
    const cacheKey = "packages:all"
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json({ packages: cached, fromCache: true })
    }

    // Fetch from database
    const packages = await sql`
      SELECT 
        id,
        name,
        description,
        price,
        interval,
        features,
        "maxStudents",
        "isPopular"
      FROM package
      WHERE "isActive" = true
      ORDER BY price ASC
    `

    // Cache for longer since packages don't change often
    await redis.set(cacheKey, packages, { ex: CACHE_TTL.LONG })

    return NextResponse.json({ packages, fromCache: false })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}
