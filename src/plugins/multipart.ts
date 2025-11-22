import type { FastifyMultipartOptions } from "@fastify/multipart";
import multipart from "@fastify/multipart";
import fp from "fastify-plugin";

export default fp<FastifyMultipartOptions>(async (fastify, _opts) => {
	await fastify.register(multipart, {
		attachFieldsToBody: "keyValues",
		limits: {
			fileSize: 10 * 1024 * 1024,
		},
	});
});
