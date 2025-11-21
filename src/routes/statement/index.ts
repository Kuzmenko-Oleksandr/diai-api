import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { IdParamSchema } from "@/common/schemas/id-param-schema";
import type { IdParam } from "@/common/types/id-param";
import type { UserIdQuery } from "@/common/types/user-id-query";
import {
	CancelStatementSchema,
	ConfirmStatementResponseSchema,
	ConfirmStatementSchema,
	CreateStatementResponseSchema,
	CreateStatementSchema,
	StatementService,
} from "@/modules/statement";
import type {
	CancelStatementRequestDto,
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
				description: "Create statement",
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
		Body: Omit<ConfirmStatementRequestDto, "statementId">;
		Params: IdParam;
	}>(
		"/confirm/:id",
		{
			schema: {
				tags: ["Statement"],
				description: "Confirm after time interval",
				consumes: ["multipart/form-data"],
				body: ConfirmStatementSchema,
				params: IdParamSchema,
				response: {
					200: ConfirmStatementResponseSchema,
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
			return await StatementService.confirm({ ...req.body, statementId: req.params.id });
		},
	);

	fastify.patch<{
		Body: Omit<CancelStatementRequestDto, "statementId">;
		Params: IdParam;
	}>(
		"/cancel/:id",
		{
			schema: {
				tags: ["Statement"],
				description: "Cancel statement",
				body: CancelStatementSchema,
				params: IdParamSchema,
				response: {
					200: CreateStatementResponseSchema,
					"4xx": { $ref: "HttpError" },
					500: { $ref: "HttpError" },
				},
			},
			preHandler: async (request) => {
				const { userId } = request.body;
				await UserService.validate(userId);
			},
		},
		async (req, _reply) => {
			return await StatementService.cancel({ ...req.body, statementId: req.params.id });
		},
	);

	fastify.patch<{
		Body: Omit<CancelStatementRequestDto, "statementId">;
		Params: IdParam;
	}>(
		"/submit/:id",
		{
			schema: {
				tags: ["Statement"],
				description: "Submit statement",
				body: CancelStatementSchema,
				params: IdParamSchema,
				response: {
					200: CreateStatementResponseSchema,
					"4xx": { $ref: "HttpError" },
					500: { $ref: "HttpError" },
				},
			},
			preHandler: async (request) => {
				const { userId } = request.body;
				await UserService.validate(userId);
			},
		},
		async (req, _reply) => {
			return await StatementService.submit({ ...req.body, statementId: req.params.id });
		},
	);

	fastify.get<{
		Querystring: UserIdQuery;
	}>(
		"/",
		{
			schema: {
				tags: ["Statement"],
				description: "Get list of user statements",
				querystring: CancelStatementSchema,
				response: {
					200: Type.Array(CreateStatementResponseSchema),
					"4xx": { $ref: "HttpError" },
					500: { $ref: "HttpError" },
				},
			},
			preHandler: async (request) => {
				const { userId } = request.query;
				await UserService.validate(userId);
			},
		},
		async (req, _reply) => {
			return await StatementService.getAllWithDetails(req.query);
		},
	);

	fastify.get<{
		Querystring: UserIdQuery;
		Params: IdParam;
	}>(
		"/:id",
		{
			schema: {
				tags: ["Statement"],
				description: "Get user statement with details",
				querystring: CancelStatementSchema,
				params: IdParamSchema,
				response: {
					200: CreateStatementResponseSchema,
					"4xx": { $ref: "HttpError" },
					500: { $ref: "HttpError" },
				},
			},
			preHandler: async (request) => {
				const { userId } = request.query;
				await UserService.validate(userId);
			},
		},
		async (req, _reply) => {
			return await StatementService.getWithDetailsById({
				...req.query,
				statementId: req.params.id,
			});
		},
	);
};

export default statement;
