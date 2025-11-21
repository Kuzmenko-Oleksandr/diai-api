import { httpErrors } from "@fastify/sensible";
import { StatementStatus } from "@prisma/client";
import { hasTimePassed } from "@/common/utils/has-time-passed";
import { prisma } from "@/db";
import { AiRecognitionService } from "../ai-recognition";
import { CarService } from "../car";
import type {
	CancelStatementRequestDto,
	ConfirmStatementRequestDto,
	CreateStatementRequestDto,
	CreateStatementResponseDto,
} from "./types";

// TODO: update interval to 5 mins after testing
const MINUTES_INTERVAL = 1;

export class StatementService {
	private static async getValidatedPlate(images: CreateStatementRequestDto["images"]) {
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

		return plate;
	}

	private static async getValidatedConfirmAttempt(
		statement: ConfirmStatementRequestDto,
		plate: string,
	) {
		const { statementId, userId, createdAt, latitude, longitude } = statement;

		const existingStatement = await prisma.statement.findFirst({
			where: {
				id: statementId,
				status: StatementStatus.PENDING,
			},
			include: {
				attempts: {
					orderBy: {
						createdAt: "asc",
					},
					where: {
						error: null,
					},
				},
			},
		});

		if (!existingStatement) {
			throw httpErrors.notFound("Заяву, яка очікує на підтвердження новими фото, не знайдено");
		}

		if (existingStatement.userId !== userId) {
			throw httpErrors.forbidden("Тільки автор заяви може підтвердити її");
		}

		const [firstAttempt] = existingStatement.attempts;

		const canConfirm = hasTimePassed({
			startDate: new Date(firstAttempt.createdAt),
			endDate: new Date(createdAt),
			milliseconds: 1000 * 60 * MINUTES_INTERVAL,
		});

		if (!canConfirm) {
			throw httpErrors.tooManyRequests(
				`Надіслати повторні фото можна не менше ніж через ${MINUTES_INTERVAL} хвилин`,
			);
		}

		const isStatementDataEqual =
			latitude === firstAttempt.latitude &&
			longitude === firstAttempt.longitude &&
			plate === firstAttempt.plate;

		if (!isStatementDataEqual) {
			await prisma.statement.update({
				where: { id: existingStatement.id },
				data: { status: StatementStatus.REFUSED },
			});

			throw httpErrors.badRequest(
				"Дані для підтвердження заяви повинні збігатись. Заяву відхилено",
			);
		}

		const confirmAttempt = await prisma.statementAttempt.create({
			data: {
				statementId: existingStatement.id,
				latitude: statement.latitude,
				longitude: statement.longitude,
				plate,
			},
		});

		return confirmAttempt;
	}

	public static async create(
		statement: CreateStatementRequestDto,
	): Promise<CreateStatementResponseDto> {
		const { images } = statement;
		const plate = await StatementService.getValidatedPlate(images);
		const car = await CarService.getDetails(plate);

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

		const [{ violation }] = createdStatement.attempts;

		return {
			...createdStatement,
			car,
			violation,
		};
	}

	public static async confirm(
		statement: ConfirmStatementRequestDto,
	): Promise<CreateStatementResponseDto> {
		const { images, statementId } = statement;
		const plate = await StatementService.getValidatedPlate(images);
		const car = await CarService.getDetails(plate);

		const confirmAttempt = await StatementService.getValidatedConfirmAttempt(statement, plate);

		const updatedStatement = await prisma.statement.update({
			where: {
				id: statementId,
			},
			data: {
				status: StatementStatus.SUBMITTED,
			},
		});

		const { violation } = confirmAttempt;

		return {
			...updatedStatement,
			car,
			violation,
		};
	}

	public static async cancel({ statementId, userId }: CancelStatementRequestDto) {
		const existingStatement = await prisma.statement.findFirst({
			where: {
				id: statementId,
				status: {
					notIn: [StatementStatus.REFUSED, StatementStatus.CANCELED],
				},
			},
			include: {
				attempts: {
					where: {
						NOT: {
							plate: null,
						},
						error: null,
					},
				},
			},
		});

		if (!existingStatement) {
			throw httpErrors.notFound("Заяву для скасування не знайдено");
		}

		if (existingStatement.userId !== userId) {
			throw httpErrors.forbidden("Тільки автор заяви може скасувати її");
		}

		const [{ violation, plate }] = existingStatement.attempts;

		const car = await CarService.getDetails(plate ?? "");

		const updatedStatement = await prisma.statement.update({
			where: { id: existingStatement.id },
			data: { status: StatementStatus.CANCELED },
		});

		return {
			...updatedStatement,
			car,
			violation,
		};
	}
}
