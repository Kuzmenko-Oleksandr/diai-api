import { StatementStatus } from "@prisma/client";
import { Type } from "@sinclair/typebox";
import { Violation } from "@/modules/ai-recognition/enums/violation";
import { CarSchema } from "@/modules/car";
import { LocationSchema } from "@/modules/location";

export const ConfirmStatementResponseSchema = Type.Object({
	id: Type.String(),
	userId: Type.String(),
	car: CarSchema,
	status: Type.Enum(StatementStatus, { description: Object.values(StatementStatus).join(", ") }),
	createdAt: Type.String({ format: "date-time" }),
	violation: Type.Union([Type.Enum(Violation), Type.Null()]),
	location: LocationSchema,
});
