"use server"

import prisma from "@/utils/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export type ProfileFormData = {
  dateOfBirth?: string
  nationality?: string
  countryOfResidence?: string
  firstLanguage?: string
  gender?: string
  centreName?: string
  centreNumber?: string
  candidateNumber?: string
  cambridgeStage?: string
  guardianName?: string
  guardianEmail?: string
  guardianPhone?: string
  guardianRelation?: string
}

export async function getLearnerProfile() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  return prisma.learnerProfile.findUnique({
    where: { userId: session.user.id },
  })
}

export async function saveLearnerProfile(data: ProfileFormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")

  const profile = await prisma.learnerProfile.upsert({
    where: { userId: session.user.id },
    update: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      completedAt: new Date(),
    },
  })

  return profile
}
