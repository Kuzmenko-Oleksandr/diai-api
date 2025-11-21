import { Type } from "@sinclair/typebox";

export const IdParamSchema = Type.Object({
	id: Type.String({
		description: "ID",
		minLength: 1,
	}),
});
