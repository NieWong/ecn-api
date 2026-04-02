-- CreateEnum
CREATE TYPE "FinanceEntryType" AS ENUM ('BUDGET', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FinanceStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "FinanceEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "FinanceEntryType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "source" TEXT,
    "purpose" TEXT,
    "usedBy" TEXT,
    "status" "FinanceStatus" NOT NULL DEFAULT 'PENDING',
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinanceEntry_type_idx" ON "FinanceEntry"("type");

-- CreateIndex
CREATE INDEX "FinanceEntry_status_idx" ON "FinanceEntry"("status");

-- CreateIndex
CREATE INDEX "FinanceEntry_transactionDate_idx" ON "FinanceEntry"("transactionDate");

-- CreateIndex
CREATE INDEX "FinanceEntry_createdById_idx" ON "FinanceEntry"("createdById");

-- CreateIndex
CREATE INDEX "FinanceEntry_managerId_idx" ON "FinanceEntry"("managerId");

-- AddForeignKey
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
