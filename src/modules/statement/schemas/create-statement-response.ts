import { StatementStatus } from "@prisma/client";
import { Type } from "@sinclair/typebox";
import { CarSchema } from "@/modules/car";

export const CreateStatementResponseSchema = Type.Object({
	id: Type.String(),
	userId: Type.String(),
	car: CarSchema,
	status: Type.Enum(StatementStatus),
	createdAt: Type.String({ format: "date-time" }),
	violation: Type.Union([Type.String(), Type.Null()]),
});
