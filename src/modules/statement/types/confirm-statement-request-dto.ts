import type { Statement } from "@prisma/client";
import type { CreateStatementRequestDto } from "./create-statement-request-dto";

export type ConfirmStatementRequestDto = CreateStatementRequestDto & {
	statementId: Statement["id"];
};
