import type { Statement, StatementAttempt } from "@prisma/client";
import type { Car } from "@/modules/car";

export type CreateStatementResponseDto = {
	car: Car;
} & Pick<Statement, "createdAt" | "status" | "id" | "userId"> &
	Pick<StatementAttempt, "violation">;
