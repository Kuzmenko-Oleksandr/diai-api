-- CreateEnum
CREATE TYPE "StatementStatus" AS ENUM ('CANCELED', 'PENDING', 'SUBMITTED', 'REFUSED');

-- CreateTable
CREATE TABLE "Statement" (
    "id" TEXT NOT NULL,
    "status" "StatementStatus" NOT NULL DEFAULT 'PENDING',
    "text" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatementAttempt" (
    "id" TEXT NOT NULL,
    "plate" TEXT,
    "violation" TEXT,
    "error" TEXT,
    "longitude" DECIMAL(65,30) NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statementId" TEXT NOT NULL,

    CONSTRAINT "StatementAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementAttempt" ADD CONSTRAINT "StatementAttempt_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "Statement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
