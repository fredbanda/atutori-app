import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardClient } from "./dashboard-client"
import { getLearnerProfile } from "@/app/actions/profile"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  const profile = await getLearnerProfile()
  const profileComplete = !!profile?.completedAt

  return (
    <DashboardClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      profileComplete={profileComplete}
    />
  )
}
