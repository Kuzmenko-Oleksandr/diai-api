import type { FastifyPluginAsync } from "fastify";
import { UserSchema, UserService } from "@/modules/user";

const user: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	fastify.get(
		"/current",
		{
			schema: {
				tags: ["User"],
				summary: "Get current user",
				description: "Retrieves the currently authenticated user",
				response: {
					200: UserSchema,
				},
			},
		},
		async (_request, _reply) => {
			return await UserService.getCurrent();
		},
	);
};

export default user;
