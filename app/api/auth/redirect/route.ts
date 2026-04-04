import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  console.log("[auth/redirect] session userId:", session?.user?.id ?? "none");
  console.log("[auth/redirect] session user:", JSON.stringify(session?.user ?? null));

  if (!session?.user?.id) {
    console.log("[auth/redirect] no session → /sign-in");
    redirect("/sign-in");
  }

  const [user] = await sql`
    SELECT onboarded, "gradeGroup" FROM "user" WHERE id = ${session.user.id}
  `;

  console.log("[auth/redirect] db user:", JSON.stringify(user ?? null));

  if (user?.onboarded && user?.gradeGroup) {
    console.log("[auth/redirect] onboarded → /playground/" + user.gradeGroup);
    redirect(`/playground/${user.gradeGroup}`);
  }

  console.log("[auth/redirect] not onboarded → /onboarding");
  redirect("/onboarding");
}
