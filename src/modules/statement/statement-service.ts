import { httpErrors } from "@fastify/sensible";
import { prisma } from "@/db";
import { AiRecognitionService } from "../ai-recognition";
import type { CreateStatementDto } from "./types";

export class StatementService {
	public static async create(statement: CreateStatementDto) {
		const { images } = statement;
		const { results } = await AiRecognitionService.getPlateDetails(images);

		const isPlateRecognized = results.every((result) => result.success);
		const arePlatesEqual = results.every((result) => result.plate === results[0].plate);

		if (!isPlateRecognized) {
			throw httpErrors.badRequest(
				"Не вдалося розпізнати номерний знак хоча б на одній із фотографій. Спробуйте ще раз",
			);
		}

		if (!arePlatesEqual) {
			throw httpErrors.badRequest("Номерні знаки не співпадають. Спробуйте ще раз");
		}

		const [{ plate }] = results;

		//TODO: add ai violation recognition
		const createdStatement = await prisma.statement.create({
			data: {
				createdAt: statement.createdAt,
				userId: statement.userId,
				attempts: {
					create: [{ latitude: statement.latitude, longitude: statement.longitude, plate }],
				},
			},
			include: {
				attempts: true,
			},
		});

		return { ...createdStatement };
	}
}
