import type { PrismaClient } from "@prisma/client/extension";
import type { FastifyInstance } from "fastify";

export const initDatabase = async (app: FastifyInstance, dbClient: PrismaClient) => {
	try {
		await dbClient.$connect();
		app.log.info("Database connection established successfully");
	} catch (error) {
		app.log.error(`Failed to connect to the database: ${error}`);
		throw error;
	}
};
