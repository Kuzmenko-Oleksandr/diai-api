import type { FastifyHelmetOptions } from "@fastify/helmet";
import helmet from "@fastify/helmet";
import fp from "fastify-plugin";

export default fp<FastifyHelmetOptions>(async (fastify, opts) => {
	await fastify.register(helmet, {
		...opts,
	});
});
