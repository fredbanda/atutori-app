/*
  Warnings:

  - Added the required column `model` to the `lesson_attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promptVersion` to the `lesson_attempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lesson_attempt" ADD COLUMN     "attemptNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "confidenceLevel" DOUBLE PRECISION,
ADD COLUMN     "difficultyLevel" TEXT,
ADD COLUMN     "improvement" DOUBLE PRECISION,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "promptVersion" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "lesson_cache" ADD COLUMN     "difficultyLevel" TEXT,
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'claude',
ADD COLUMN     "modelVersion" TEXT,
ADD COLUMN     "qualityScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "model_performance" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "avgScore" DOUBLE PRECISION NOT NULL,
    "attempts" INTEGER NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_model_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "avgScore" DOUBLE PRECISION NOT NULL,
    "usageCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_model_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_performance" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "avgScore" DOUBLE PRECISION NOT NULL,
    "usageCount" INTEGER NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "prompt_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_cache" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "voice" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audio_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "model_performance_subjectId_grade_model_key" ON "model_performance"("subjectId", "grade", "model");

-- CreateIndex
CREATE UNIQUE INDEX "user_model_preference_userId_subjectId_model_key" ON "user_model_preference"("userId", "subjectId", "model");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_performance_promptId_model_key" ON "prompt_performance"("promptId", "model");

-- CreateIndex
CREATE UNIQUE INDEX "audio_cache_text_key" ON "audio_cache"("text");

-- CreateIndex
CREATE INDEX "lesson_attempt_subjectId_grade_model_idx" ON "lesson_attempt"("subjectId", "grade", "model");
