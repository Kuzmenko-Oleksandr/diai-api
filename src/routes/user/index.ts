import type { FastifyPluginAsync } from "fastify";
import { UserSchema, UserService } from "@/modules/user";

const user: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	fastify.get(
		"/current",
		{
			schema: {
				tags: ["User"],
				summary: "Get current user",
				description: "Retrieves the currently (mocked) authenticated user",
				response: {
					200: UserSchema,
					"4xx": { $ref: "HttpError" },
					500: { $ref: "HttpError" },
				},
			},
		},
		async (_request, _reply) => {
			return await UserService.getCurrent();
		},
	);
};

export default user;
