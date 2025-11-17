import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import dotenv from "dotenv";
import Fastify from "fastify";
import {IS_PRODUCTION} from "@/common/constants/is-production";
import {getCloseWithGraceListener} from "@/common/utils/get-close-with-grace-listener";
import {prisma} from "@/db";
import {initDatabase} from "@/db/helpers/init-database";
import {app} from ".";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

const HOST =
    process.env.SERVER_HOSTNAME ??
    (IS_PRODUCTION ? "0.0.0.0" : "localhost");

const BASE_URL =
    process.env.BASE_URL ??
    (IS_PRODUCTION
        ? `http://${HOST}:${PORT}`
        : `http://localhost:${PORT}`);

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
                url: BASE_URL,
                description: IS_PRODUCTION ? "Production" : "Local development",
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
    port: PORT,
    host: HOST,
});

void server.ready((err) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }

    server.log.info("All routes loaded");
    server.log.info(`Server listening on port ${PORT}`);
    server.log.info(`Documentation: ${BASE_URL}/documentation`);

    for (const route of server.printRoutes().split("\n")) {
        server.log.info(`Registered route: ${route}`);
    }
});

export {server as app};