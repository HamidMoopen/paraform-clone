/*
  Warnings:

  - You are about to drop the `HiringManagerCompany` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyId` to the `HiringManager` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HiringManagerCompany" DROP CONSTRAINT "HiringManagerCompany_companyId_fkey";

-- DropForeignKey
ALTER TABLE "HiringManagerCompany" DROP CONSTRAINT "HiringManagerCompany_hiringManagerId_fkey";

-- AlterTable
ALTER TABLE "HiringManager" ADD COLUMN     "companyId" TEXT NOT NULL;

-- DropTable
DROP TABLE "HiringManagerCompany";

-- CreateIndex
CREATE INDEX "Application_roleId_idx" ON "Application"("roleId");

-- CreateIndex
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");

-- CreateIndex
CREATE INDEX "Message_applicationId_idx" ON "Message"("applicationId");

-- CreateIndex
CREATE INDEX "Role_companyId_idx" ON "Role"("companyId");

-- CreateIndex
CREATE INDEX "Role_hiringManagerId_idx" ON "Role"("hiringManagerId");

-- AddForeignKey
ALTER TABLE "HiringManager" ADD CONSTRAINT "HiringManager_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
