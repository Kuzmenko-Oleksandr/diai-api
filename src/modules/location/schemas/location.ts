import { Type } from "@sinclair/typebox";

export const LocationSchema = Type.Object({
	address: Type.String(),
	latitude: Type.Number(),
	longitude: Type.Number(),
});
