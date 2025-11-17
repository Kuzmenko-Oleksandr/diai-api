import { prisma } from "@/db";

export class UserService {
	public static async getCurrent() {
		return await prisma.user.findFirst();
	}
}
