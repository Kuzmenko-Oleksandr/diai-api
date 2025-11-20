import type { FastifyPluginAsync } from "fastify";
import {
	ConfirmStatementSchema,
	CreateStatementResponseSchema,
	CreateStatementSchema,
	StatementService,
} from "@/modules/statement";
import type {
	ConfirmStatementRequestDto,
	CreateStatementRequestDto,
} from "@/modules/statement/types";
import { UserService } from "@/modules/user";

const statement: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	fastify.post<{
		Body: CreateStatementRequestDto;
	}>(
		"/",
		{
			schema: {
				tags: ["Statement"],
				consumes: ["multipart/form-data"],
				body: CreateStatementSchema,
				response: {
					200: CreateStatementResponseSchema,
					"4xx": { $ref: "HttpError" },
					500: { $ref: "HttpError" },
				},
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

	fastify.post<{
		Body: ConfirmStatementRequestDto;
	}>(
		"/confirm",
		{
			schema: {
				tags: ["Statement"],
				consumes: ["multipart/form-data"],
				body: ConfirmStatementSchema,
				response: {
					200: CreateStatementResponseSchema,
					"4xx": { $ref: "HttpError" },
					500: { $ref: "HttpError" },
				},
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
			return await StatementService.confirm(req.body);
		},
	);
};

export default statement;
