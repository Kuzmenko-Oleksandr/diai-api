import type { Static } from "@sinclair/typebox";
import type { UserSchema } from "../schemas/user";

export type User = Static<typeof UserSchema>;
