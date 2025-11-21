import { Type } from "@sinclair/typebox";

export const CancelStatementSchema = Type.Object({
	userId: Type.String({
		description: "User ID",
		minLength: 1,
	}),
});
