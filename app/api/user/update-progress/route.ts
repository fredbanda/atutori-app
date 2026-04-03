import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { xpEarned } = await request.json()

    // Get current user data
    const [user] = await sql`
      SELECT xp, level, "streakDays", "lastActiveAt"
      FROM "user"
      WHERE id = ${session.user.id}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate new XP and level
    const currentXp = user.xp || 0
    const newXp = currentXp + xpEarned
    const xpPerLevel = 100
    const newLevel = Math.floor(newXp / xpPerLevel) + 1

    // Calculate streak
    const now = new Date()
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null
    let newStreak = user.streakDays || 0

    if (lastActive) {
      const daysDiff = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysDiff === 1) {
        newStreak += 1
      } else if (daysDiff > 1) {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    // Update user
    await sql`
      UPDATE "user"
      SET xp = ${newXp},
          level = ${newLevel},
          "streakDays" = ${newStreak},
          "lastActiveAt" = NOW(),
          "updatedAt" = NOW()
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({
      success: true,
      xp: newXp,
      level: newLevel,
      streakDays: newStreak,
    })
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
