import { httpErrors } from "@fastify/sensible";
import type { User } from "@prisma/client";
import { prisma } from "@/db";

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
