import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import dotenv from "dotenv";
import Fastify from "fastify";
import { IS_PRODUCTION } from "@/common/constants/is-production";
import { getCloseWithGraceListener } from "@/common/utils/get-close-with-grace-listener";
import { prisma } from "@/db";
import { initDatabase } from "@/db/helpers/init-database";
import { app } from ".";

dotenv.config();

const server = Fastify({
	logger: IS_PRODUCTION
		? true
		: {
				level: "info",
				transport: {
					target: "pino-pretty",
					options: {
						translateTime: "SYS:HH:MM:ss Z",
						ignore: "pid,hostname",
						colorize: true,
					},
				},
			},
}).withTypeProvider<TypeBoxTypeProvider>();

void server.register(cors);

void server.register(swagger, {
	openapi: {
		openapi: "3.0.0",
		info: {
			title: "ДіАІ API",
			version: "0.0.1",
			description: "API for ДіАІ",
		},
		servers: [
			{
				url:
					process.env.BASE_URL ??
					`http://${process.env.SERVER_HOSTNAME ?? "localhost"}:${Number(process.env.PORT ?? 3000)}`,
			},
		],
	},
});

void server.register(swaggerUI, {
	routePrefix: "/documentation",
	uiConfig: {
		docExpansion: "list",
		deepLinking: false,
	},
	staticCSP: false,
	transformStaticCSP: (header) => header,
});

void server.register(app);

void initDatabase(server, prisma);

const closeListeners = getCloseWithGraceListener(server, prisma);

server.addHook("onClose", (_instance, done) => {
	closeListeners.uninstall();
	done();
});

void server.listen({
	port: Number(process.env.PORT ?? 3000),
	host: process.env.SERVER_HOSTNAME ?? "localhost",
});

void server.ready((err) => {
	if (err) {
		server.log.error(err);
		process.exit(1);
	}

	server.log.info("All routes loaded");
	server.log.info(`Server listening on port ${Number(process.env.PORT ?? 3000)}`);
	server.log.info(`Documentation: ${process.env.BASE_URL}/documentation`);

	for (const route of server.printRoutes().split("\n")) {
		server.log.info(`Registered route: ${route}`);
	}
});

export { server as app };
