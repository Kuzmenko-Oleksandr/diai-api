import type { FastifyPluginAsync } from "fastify";
import { StatementService } from "@/modules/statement";
import type { CreateStatementDto } from "@/modules/statement/types";

const statement: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	fastify.post<{
		Body: CreateStatementDto;
	}>(
		"/create",
		{
			schema: {
				tags: ["Statement"],
				consumes: ["multipart/form-data"],
				body: {
					type: "object",
					properties: {
						images: {
							type: "array",
							items: { isFile: true },
						},
					},
				},
			},
			preValidation: (request, _reply, done) => {
				const { images } = request.body;
				request.body.images = Array.isArray(images) ? images : [images];
				done();
			},
		},
		async (req, _reply) => {
			return await StatementService.create(req.body);
		},
	);
};

export default statement;
