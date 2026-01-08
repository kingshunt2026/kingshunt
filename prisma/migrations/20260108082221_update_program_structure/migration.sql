/*
  Warnings:

  - You are about to drop the column `ageGroup` on the `Program` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Program" DROP COLUMN "ageGroup",
ADD COLUMN     "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "level" TEXT,
ADD COLUMN     "structure" TEXT[] DEFAULT ARRAY[]::TEXT[];
