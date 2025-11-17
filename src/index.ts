import { join } from "node:path";
import type { AutoloadPluginOptions } from "@fastify/autoload";
import AutoLoad from "@fastify/autoload";
import type { FastifyPluginAsync } from "fastify";

export type AppOptions = Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
	void fastify.register(AutoLoad, {
		dir: join(__dirname, "plugins"),
		options: opts,
	});

	void fastify.register(AutoLoad, {
		dir: join(__dirname, "routes"),
		options: { ...opts, prefix: "/api" },
	});
};

export { app };
