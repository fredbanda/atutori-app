import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ProfileForm } from "./profile-form"

export default async function CompleteProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  return (
    <div>
      <header className="border-b border-border bg-card px-4 py-4 text-center">
        <span className="text-xl font-bold text-foreground">eatutori</span>
        <p className="text-sm text-muted-foreground mt-0.5">Complete your learner profile</p>
      </header>
      <ProfileForm />
    </div>
  )
}
