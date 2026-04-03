import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export default async function PlaygroundLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ gradeGroup: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Check if user belongs to this grade group
  const { gradeGroup } = await params
  const [user] = await sql`
    SELECT grade, "gradeGroup", onboarded FROM "user" WHERE id = ${session.user.id}
  `

  if (!user?.onboarded) {
    redirect("/onboarding")
  }

  if (user.gradeGroup !== gradeGroup) {
    redirect(`/playground/${user.gradeGroup}`)
  }

  return <>{children}</>
}
