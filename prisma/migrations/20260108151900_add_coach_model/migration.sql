-- CreateEnum
CREATE TYPE "CoachType" AS ENUM ('HEAD_COACH', 'COACH', 'ASSISTANT_COACH', 'PERFORMANCE_ANALYST');

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "image" TEXT,
    "type" "CoachType" NOT NULL DEFAULT 'COACH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Coach_type_idx" ON "Coach"("type");
