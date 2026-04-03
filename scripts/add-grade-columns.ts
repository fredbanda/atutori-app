import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(databaseUrl)

async function addGradeColumns() {
  console.log("Adding grade columns to user table...")

  // Add grade column if not exists
  await sql`
    ALTER TABLE "user" 
    ADD COLUMN IF NOT EXISTS "grade" INTEGER
  `
  console.log("Added grade column")

  // Add gradeGroup column if not exists
  await sql`
    ALTER TABLE "user" 
    ADD COLUMN IF NOT EXISTS "gradeGroup" TEXT
  `
  console.log("Added gradeGroup column")

  // Add onboarded column if not exists
  await sql`
    ALTER TABLE "user" 
    ADD COLUMN IF NOT EXISTS "onboarded" BOOLEAN DEFAULT false
  `
  console.log("Added onboarded column")

  console.log("Grade columns added successfully!")
}

addGradeColumns().catch(console.error)
