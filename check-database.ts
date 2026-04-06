// Check what's actually in our database
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("📊 Current SubjectPrompt records in database:\n");

  const allPrompts = await prisma.subjectPrompt.findMany({
    orderBy: [{ grade: "asc" }, { subjectId: "asc" }],
    select: {
      id: true,
      grade: true,
      subjectId: true,
      subjectName: true,
      cambridgeStage: true,
      isActive: true,
      version: true,
      topicFocus: true,
    },
  });

  if (allPrompts.length === 0) {
    console.log("❌ No SubjectPrompt records found in database!");
    console.log(
      "   Run the seeding script: npx tsx seeds/grade1-math-complete.ts"
    );
  } else {
    console.log(`Found ${allPrompts.length} SubjectPrompt records:`);
    console.log(
      "┌─────────┬─────────────────────┬─────────────────────┬────────────┬────────┐"
    );
    console.log(
      "│ Grade   │ Subject ID          │ Subject Name        │ Active     │ Stage  │"
    );
    console.log(
      "├─────────┼─────────────────────┼─────────────────────┼────────────┼────────┤"
    );

    for (const prompt of allPrompts) {
      const grade = prompt.grade.toString().padEnd(7);
      const subjectId = prompt.subjectId.padEnd(19);
      const subjectName = (prompt.subjectName || "").slice(0, 19).padEnd(19);
      const active = (prompt.isActive ? "✅ Yes" : "❌ No").padEnd(10);
      const stage = (prompt.cambridgeStage || "").slice(0, 6).padEnd(6);

      console.log(
        `│ ${grade} │ ${subjectId} │ ${subjectName} │ ${active} │ ${stage} │`
      );
    }
    console.log(
      "└─────────┴─────────────────────┴─────────────────────┴────────────┴────────┘"
    );
  }

  await prisma.$disconnect();
}

checkDatabase().catch(console.error);
