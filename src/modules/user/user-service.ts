import { httpErrors } from "@fastify/sensible";
import { prisma } from "@/db";
import type { User } from "./types";

export class UserService {
	public static async getCurrent() {
		return await prisma.user.findFirst();
	}

	public static async validate(userId: User["id"]) {
		const existingUser = await prisma.user.findFirst({ where: { id: userId } });

		if (!existingUser) {
			throw httpErrors.notFound("Користувача не знайдено");
		}

		return !!existingUser;
	}
}
