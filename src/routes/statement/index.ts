import type { FastifyPluginAsync } from "fastify";
import { StatementService } from "@/modules/statement";
import { CreateStatementSchema } from "@/modules/statement/schemas/create-statement";
import type { CreateStatementDto } from "@/modules/statement/types";
import { UserService } from "@/modules/user";

const statement: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	fastify.post<{
		Body: CreateStatementDto;
	}>(
		"/",
		{
			schema: {
				tags: ["Statement"],
				consumes: ["multipart/form-data"],
				body: CreateStatementSchema,
			},
			preValidation: (request, _reply, done) => {
				const { images } = request.body;
				request.body.images = Array.isArray(images) ? images : [images];
				done();
			},
			preHandler: async (request) => {
				const { userId } = request.body;
				await UserService.validate(userId);
			},
		},
		async (req, _reply) => {
			return await StatementService.create(req.body);
		},
	);
};

export default statement;
