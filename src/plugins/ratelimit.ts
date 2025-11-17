import type { RateLimitOptions } from "@fastify/rate-limit";
import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

export default fp<RateLimitOptions>(
	async (
		fastify,
		opts = {
			max: 100,
			timeWindow: "1 minute",
		},
	) => {
		await fastify.register(rateLimit, {
			...opts,
		});
	},
);
