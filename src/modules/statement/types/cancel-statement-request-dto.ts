import type { Statement, User } from "@prisma/client";

export type CancelStatementRequestDto = {
	userId: User["id"];
	statementId: Statement["id"];
};
