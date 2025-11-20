import { Type } from "@sinclair/typebox";

export const CarSchema = Type.Object({
	plate: Type.String(),
	model: Type.String(),
	company: Type.String(),
	year: Type.Number(),
	color: Type.String(),
});
