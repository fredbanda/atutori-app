import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { OnboardingClient } from "./onboarding-client"

const sql = neon(process.env.DATABASE_URL!)

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Check if user is already onboarded
  const [user] = await sql`
    SELECT onboarded, "gradeGroup" FROM "user" WHERE id = ${session.user.id}
  `

  if (user?.onboarded && user?.gradeGroup) {
    redirect(`/playground/${user.gradeGroup}`)
  }

  return <OnboardingClient />
}
