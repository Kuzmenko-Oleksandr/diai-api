import { Type } from "@sinclair/typebox";

export const UserSchema = Type.Object({
	id: Type.String({ format: "uuid" }),
	email: Type.String({ format: "email" }),
	firstName: Type.String(),
	lastName: Type.String(),
	middleName: Type.Union([Type.String(), Type.Null()]),
	phoneNumber: Type.String(),
	dob: Type.String({ format: "date-time" }),
	createdAt: Type.String({ format: "date-time" }),
	updatedAt: Type.String({ format: "date-time" }),
});
