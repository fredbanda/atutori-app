import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { PlaygroundClient } from "./playground-client"

const sql = neon(process.env.DATABASE_URL!)

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ gradeGroup: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const { gradeGroup } = await params
  const [user] = await sql`
    SELECT id, name, email, grade, "gradeGroup", level, xp, "streakDays"
    FROM "user"
    WHERE id = ${session.user.id}
  `

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <PlaygroundClient
      user={{
        id: user.id,
        name: user.name || "Student",
        email: user.email,
        grade: user.grade,
        gradeGroup: user.gradeGroup,
        level: user.level || 1,
        xp: user.xp || 0,
        streakDays: user.streakDays || 0,
      }}
      gradeGroup={gradeGroup}
    />
  )
}
