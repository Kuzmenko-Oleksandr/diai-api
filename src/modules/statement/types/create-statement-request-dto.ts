import type { Statement, StatementAttempt } from "@prisma/client";

export type CreateStatementRequestDto = {
	images: Buffer[];
} & Pick<Statement, "createdAt" | "userId"> &
	Pick<StatementAttempt, "latitude" | "longitude">;
