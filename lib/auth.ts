import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/utils/prisma";

function stripQuotes(value?: string) {
  if (typeof value !== "string") return value;
  return value.replace(/^['"]|['"]$/g, "");
}

const rawAuthSecret = process.env.BETTER_AUTH_SECRET;
const BETTER_AUTH_SECRET = stripQuotes(rawAuthSecret);

if (!BETTER_AUTH_SECRET || typeof BETTER_AUTH_SECRET !== "string") {
  throw new Error(
    `Missing or invalid BETTER_AUTH_SECRET environment variable. Got: ${String(
      rawAuthSecret
    )}`
  );
}

export const auth = (() => {
  try {
    return betterAuth({
      database: prismaAdapter(prisma, {
        provider: "postgresql",
      }),
      // Use the secret from env — better-auth will accept it internally from process.env,
      // but we validate it here to prevent accidental non-string values.
      secret: BETTER_AUTH_SECRET,
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
          enabled: false,
        },
      },
      user: {
        additionalFields: {
          grade: {
            type: "number",
            required: false,
          },
          gradeGroup: {
            type: "string",
            required: false,
          },
          level: {
            type: "number",
            required: false,
            defaultValue: 1,
          },
          xp: {
            type: "number",
            required: false,
            defaultValue: 0,
          },
          streakDays: {
            type: "number",
            required: false,
            defaultValue: 0,
          },
          lastActiveAt: {
            type: "date",
            required: false,
          },
          onboarded: {
            type: "boolean",
            required: false,
            defaultValue: false,
          },
        },
      },
      trustedOrigins: [
        "https://eatutori.vercel.app",
        ...(process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")
          ? [process.env.BETTER_AUTH_URL]
          : []),
      ],
      advanced: {
        crossSubdomainCookies: { enabled: false },
        defaultCookieAttributes: {
          secure: true,
          sameSite: "lax",
        },
      },
      plugins: [nextCookies()],
    });
  } catch (err) {
    console.error("Failed to initialize betterAuth:", err);
    throw err;
  }
})();

export type Session = typeof auth.$Infer.Session;

