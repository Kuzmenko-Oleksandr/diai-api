import { Type } from "@sinclair/typebox";

export const CreateStatementSchema = Type.Object({
	images: Type.Array(Type.Object({}, { description: "Uploaded file object" }), {
		description: "Array of uploaded image files. Use multipart/form-data",
	}),
	longitude: Type.Number({
		description: "Longitude coordinate",
	}),
	latitude: Type.Number({
		description: "Latitude coordinate",
	}),
	userId: Type.String({
		description: "User ID",
		minLength: 1,
	}),
	createdAt: Type.String({
		format: "date-time",
	}),
});
