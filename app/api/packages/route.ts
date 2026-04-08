import { NextResponse } from "next/server"
import { redis, CACHE_TTL } from "@/lib/redis"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    // Try cache first
    const cacheKey = "packages:all"
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json({ packages: JSON.parse(cached), fromCache: true })
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
    await redis.set(cacheKey, JSON.stringify(packages), "EX", CACHE_TTL.packages)

    return NextResponse.json({ packages, fromCache: false })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}
