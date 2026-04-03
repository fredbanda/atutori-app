import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
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
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
