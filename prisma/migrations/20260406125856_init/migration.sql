-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "grade" INTEGER,
    "gradeGroup" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "onboarded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "gradeGroup" TEXT NOT NULL,
    "subjectId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assignment" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "watchedAt" TIMESTAMP(3),
    "quizCompleted" BOOLEAN NOT NULL DEFAULT false,
    "quizScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "interval" TEXT NOT NULL,
    "features" TEXT[],
    "maxStudents" INTEGER NOT NULL DEFAULT 1,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_prompt" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "cambridgeStage" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "systemPrompt" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "contentSteps" INTEGER NOT NULL DEFAULT 2,
    "quizCount" INTEGER NOT NULL DEFAULT 3,
    "difficultyHint" TEXT,
    "topicFocus" TEXT,
    "outputSchema" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_cache" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "redisKey" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "generatedContent" JSONB NOT NULL,
    "promptVersion" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cacheId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "cambridgeStage" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB NOT NULL,
    "durationSeconds" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "lesson_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "countryOfResidence" TEXT,
    "firstLanguage" TEXT,
    "gender" TEXT,
    "centreName" TEXT,
    "centreNumber" TEXT,
    "candidateNumber" TEXT,
    "cambridgeStage" TEXT,
    "guardianName" TEXT,
    "guardianEmail" TEXT,
    "guardianPhone" TEXT,
    "guardianRelation" TEXT,
    "previousResults" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "media_assignment_mediaId_studentId_key" ON "media_assignment"("mediaId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_prompt_subjectId_grade_version_key" ON "subject_prompt"("subjectId", "grade", "version");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_cache_redisKey_key" ON "lesson_cache"("redisKey");

-- CreateIndex
CREATE INDEX "lesson_cache_cacheKey_idx" ON "lesson_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "lesson_attempt_userId_idx" ON "lesson_attempt"("userId");

-- CreateIndex
CREATE INDEX "lesson_attempt_userId_subjectId_idx" ON "lesson_attempt"("userId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "learner_profile_userId_key" ON "learner_profile"("userId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assignment" ADD CONSTRAINT "media_assignment_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_cache" ADD CONSTRAINT "lesson_cache_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "subject_prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_attempt" ADD CONSTRAINT "lesson_attempt_cacheId_fkey" FOREIGN KEY ("cacheId") REFERENCES "lesson_cache"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
