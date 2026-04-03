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

    const { grade, gradeGroup } = await request.json()

    if (!grade || !gradeGroup) {
      return NextResponse.json(
        { error: "Grade and gradeGroup are required" },
        { status: 400 }
      )
    }

    // Update user's grade info
    await sql`
      UPDATE "user"
      SET grade = ${grade},
          "gradeGroup" = ${gradeGroup},
          onboarded = true,
          "updatedAt" = NOW()
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating grade:", error)
    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    )
  }
}
