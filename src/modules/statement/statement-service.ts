import { httpErrors } from "@fastify/sensible";
import { prisma } from "@/db";
import { AiRecognitionService } from "../ai-recognition";
import type { CreateStatementDto } from "./types";

export class StatementService {
	public static async create(statement: CreateStatementDto) {
		const { images } = statement;

		const imageFiles: File[] = await Promise.all(
			images.map(async (image) => {
				const bytes = await image.toBuffer();
				const { filename, mimetype } = image;

				return new File([bytes], filename, { type: mimetype });
			}),
		);

		const { results } = await AiRecognitionService.getPlateDetails(imageFiles);

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
		const createdAttempt = await prisma.statementAttempt.create({
			data: {
				...statement,
				plate,
				statement: {
					create: {
						...statement,
					},
				},
			},
		});

		const createdStatement = await prisma.statement.findFirst({
			where: { id: createdAttempt.statementId },
		});

		return { ...createdStatement, ...createdAttempt };
	}
}
