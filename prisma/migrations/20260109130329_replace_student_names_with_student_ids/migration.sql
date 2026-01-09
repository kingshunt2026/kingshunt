/*
  Warnings:

  - You are about to drop the column `studentNames` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "studentNames",
ADD COLUMN     "studentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
