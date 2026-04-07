import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [user] = await sql`
    SELECT onboarded, "gradeGroup" FROM "user" WHERE id = ${session.user.id}
  `;

  if (user?.onboarded && user?.gradeGroup) {
    redirect(`/playground/${user.gradeGroup}`);
  }

  redirect("/onboarding");
}
