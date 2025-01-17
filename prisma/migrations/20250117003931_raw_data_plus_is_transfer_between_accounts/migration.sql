-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isTransferBetweenAccounts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rawData" JSONB;
