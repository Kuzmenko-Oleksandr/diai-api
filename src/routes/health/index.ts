import type { FastifyPluginAsync } from "fastify";

const health: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	fastify.get(
		"/",
		{
			schema: {
				tags: ["Health"],
				summary: "Health check",
				description: "Return server health",
			},
		},
		async (_request, reply) => {
			void reply.send({ success: true });
		},
	);
};

export default health;
