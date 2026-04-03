import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";


function stripQuotes(value?: string) {
  if (typeof value !== "string") return value;
  return value.replace(/^['"]|['"]$/g, "");
}

const rawDatabaseUrl = process.env.DATABASE_URL;
const DATABASE_URL = stripQuotes(rawDatabaseUrl);

if (!DATABASE_URL || typeof DATABASE_URL !== "string") {
  // Fail fast with a clear message so it's easier to debug in dev
  throw new Error(
    `Invalid or missing DATABASE_URL environment variable. Got: ${String(
      rawDatabaseUrl
    )}`
  );
}

function createPrismaClient() {
  try {
    const pool = new Pool({ connectionString: DATABASE_URL });
    // PrismaNeon typings expect a config shape in some versions; cast to any to
    // avoid a noisy type error while preserving runtime behavior.
    const adapter = new PrismaNeon(pool as unknown as any);
    return new PrismaClient({ adapter });
  } catch (err) {
    // Re-throw after logging for better visibility in server logs
    console.error("Failed to create Prisma client:", err);
    throw err;
  }
}