import { Type } from "@sinclair/typebox";

export const UserIdQuerySchema = Type.Object({
	userId: Type.String({
		description: "User ID",
		minLength: 1,
	}),
});
