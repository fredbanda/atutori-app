import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { SubjectNav } from "@/components/eatutori/subject-nav";
import { PlaygroundHeader } from "@/components/eatutori/playground-header";

const sql = neon(process.env.DATABASE_URL!);

export default async function PlaygroundLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gradeGroup: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Check if user belongs to this grade group
  const { gradeGroup } = await params;
  const [user] = await sql`
    SELECT id, name, email, grade, "gradeGroup", level, xp, "streakDays", onboarded 
    FROM "user" WHERE id = ${session.user.id}
  `;

  if (!user?.onboarded) {
    redirect("/onboarding");
  }

  if (user.gradeGroup !== gradeGroup) {
    redirect(`/playground/${user.gradeGroup}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlaygroundHeader user={user} gradeGroup={gradeGroup} />
      <SubjectNav gradeGroup={gradeGroup} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

