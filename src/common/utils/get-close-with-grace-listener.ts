import type { PrismaClient } from "@prisma/client";
import closeWithGrace from "close-with-grace";
import type { FastifyInstance } from "fastify";

export const getCloseWithGraceListener = (app: FastifyInstance, dbClient: PrismaClient) => {
	return closeWithGrace({ delay: 500 }, async (opts) => {
		const { err } = opts;

		if (err) {
			app.log.error(err);
		}

		await dbClient.$disconnect();
		await app.close();
	});
};
