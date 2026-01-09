-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_programId_fkey";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "programId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
