-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "plate" TEXT,
    "company" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "statementAttemptId" TEXT NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_statementAttemptId_key" ON "Car"("statementAttemptId");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_statementAttemptId_fkey" FOREIGN KEY ("statementAttemptId") REFERENCES "StatementAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
