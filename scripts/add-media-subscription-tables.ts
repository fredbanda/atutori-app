import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set")
}
const sql = neon(databaseUrl)

async function main() {
  console.log("Creating media, media_assignment, package, and subscription tables...")

  // Create media table
  await sql`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      "thumbnailUrl" TEXT,
      duration INTEGER,
      "gradeGroup" TEXT NOT NULL,
      "subjectId" TEXT,
      "uploadedById" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `
  console.log("Created media table")

  // Create media_assignment table
  await sql`
    CREATE TABLE IF NOT EXISTS media_assignment (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "mediaId" TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      "studentId" TEXT NOT NULL,
      "assignedById" TEXT NOT NULL,
      watched BOOLEAN NOT NULL DEFAULT false,
      "watchedAt" TIMESTAMP(3),
      "quizCompleted" BOOLEAN NOT NULL DEFAULT false,
      "quizScore" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("mediaId", "studentId")
    )
  `
  console.log("Created media_assignment table")

  // Create package table
  await sql`
    CREATE TABLE IF NOT EXISTS package (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      interval TEXT NOT NULL,
      features TEXT[] NOT NULL DEFAULT '{}',
      "maxStudents" INTEGER NOT NULL DEFAULT 1,
      "isPopular" BOOLEAN NOT NULL DEFAULT false,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `
  console.log("Created package table")

  // Create subscription table
  await sql`
    CREATE TABLE IF NOT EXISTS subscription (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "packageId" TEXT NOT NULL REFERENCES package(id),
      status TEXT NOT NULL,
      "currentPeriodStart" TIMESTAMP(3) NOT NULL,
      "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
      "cancelledAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `
  console.log("Created subscription table")

  // Insert default packages
  await sql`
    INSERT INTO package (id, name, description, price, interval, features, "maxStudents", "isPopular")
    VALUES 
      ('pkg_starter', 'Starter', 'Perfect for getting started with one child', 0, 'monthly', 
       ARRAY['1 student account', 'Access to all grade levels', 'Basic progress tracking', '5 AI quizzes per day'], 
       1, false),
      ('pkg_family', 'Family', 'Best for families with multiple children', 999, 'monthly',
       ARRAY['Up to 3 student accounts', 'Access to all grade levels', 'Advanced progress tracking', 'Unlimited AI quizzes', 'Video lessons', 'Parent dashboard'],
       3, true),
      ('pkg_premium', 'Premium', 'Complete learning experience for larger families', 1999, 'monthly',
       ARRAY['Up to 6 student accounts', 'Access to all grade levels', 'Advanced progress tracking', 'Unlimited AI quizzes', 'Video lessons', 'Parent & tutor dashboard', 'Priority support', 'Custom learning paths'],
       6, false),
      ('pkg_yearly', 'Family Yearly', 'Save 20% with annual billing', 9590, 'yearly',
       ARRAY['Up to 3 student accounts', 'Access to all grade levels', 'Advanced progress tracking', 'Unlimited AI quizzes', 'Video lessons', 'Parent dashboard', '2 months free'],
       3, false)
    ON CONFLICT (id) DO NOTHING
  `
  console.log("Inserted default packages")

  console.log("Migration completed successfully!")
}

main().catch(console.error)
