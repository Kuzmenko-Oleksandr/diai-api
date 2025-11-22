-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_statementAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "Statement" DROP CONSTRAINT "Statement_userId_fkey";

-- DropForeignKey
ALTER TABLE "StatementAttempt" DROP CONSTRAINT "StatementAttempt_statementId_fkey";

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementAttempt" ADD CONSTRAINT "StatementAttempt_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "Statement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_statementAttemptId_fkey" FOREIGN KEY ("statementAttemptId") REFERENCES "StatementAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
