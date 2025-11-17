import type { FastifySensibleOptions } from "@fastify/sensible";
import sensible from "@fastify/sensible";
import fp from "fastify-plugin";

export default fp<FastifySensibleOptions>(async (fastify, opts) => {
	await fastify.register(sensible, {
		...opts,
	});
});
