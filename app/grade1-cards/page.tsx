import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Grade1PlaygroundClient } from "@/components/eatutori/Grade1PlaygroundClient";

interface User {
  id: string;
  name: string;
  email: string;
  grade: number;
  gradeGroup: string;
  level: number;
  xp: number;
  streakDays: number;
}

export default async function Grade1CardsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Mock user data for Grade 1 - in real app this would come from database
  const user: User = {
    id: session.user.id,
    name: session.user.name || "Student",
    email: session.user.email || "",
    grade: 1,
    gradeGroup: "primary-early",
    level: 3,
    xp: 750,
    streakDays: 5,
  };

  return <Grade1PlaygroundClient user={user} />;
}
