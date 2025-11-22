import { httpErrors } from "@fastify/sensible";
import { type Statement, StatementStatus } from "@prisma/client";
import { hasTimePassed } from "@/common/utils/has-time-passed";
import { prisma } from "@/db";
import { AiRecognitionService } from "../ai-recognition";
import type { Violation } from "../ai-recognition/enums/violation";
import { type Car, CarService } from "../car";
import { LocationService } from "../location";
import type {
	CancelStatementRequestDto,
	ConfirmStatementRequestDto,
	CreateStatementRequestDto,
	CreateStatementResponseDto,
} from "./types";

// TODO: update interval to 5 mins after testing
const MINUTES_INTERVAL = 1;
const VALID_METERS_DISTANCE = 10;

export class StatementService {
	private static async getValidatedPlate(images: CreateStatementRequestDto["images"]) {
		const { results } = await AiRecognitionService.getViolationDetails(images);

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
		const { sign } = results.find((r) => !!r.sign.class_name) ?? {};

		return { plate, violation: sign?.class_name ?? null };
	}

	private static async getValidatedConfirmAttempt({
		statement,
		plate,
		violation,
	}: {
		statement: ConfirmStatementRequestDto;
		plate: string;
		violation: Violation | null;
	}) {
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
						NOT: { plate: null },
						error: null,
					},
					include: {
						car: true,
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
		const car = firstAttempt.car as Car;

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

		// TODO: add location comparison
		const isLocationEqual =
			LocationService.getDistance({
				startPoint: {
					latitude: Number.parseFloat(String(firstAttempt.latitude)),
					longitude: Number.parseFloat(String(firstAttempt.longitude)),
				},
				endPoint: {
					latitude: Number.parseFloat(String(latitude)),
					longitude: Number.parseFloat(String(longitude)),
				},
			}) <= VALID_METERS_DISTANCE;

		const isStatementDataEqual =
			plate === firstAttempt.plate && violation === firstAttempt.violation;

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
				violation,
				car: {
					create: {
						plate: car.plate,
						company: car.company,
						model: car.model,
						year: car.year,
						color: car.color,
					},
				},
			},
			include: {
				car: true,
			},
		});

		return confirmAttempt;
	}

	public static async create(
		statement: CreateStatementRequestDto,
	): Promise<CreateStatementResponseDto> {
		const { images } = statement;
		const { plate, violation } = await StatementService.getValidatedPlate(images);
		const car = await CarService.getDetails(plate);

		if (!violation) {
			throw httpErrors.badRequest("Порушення не знайдено");
		}

		const createdStatement = await prisma.statement.create({
			data: {
				createdAt: statement.createdAt,
				userId: statement.userId,
				attempts: {
					create: [
						{
							latitude: statement.latitude,
							longitude: statement.longitude,
							plate,
							violation,
							car: {
								create: {
									plate: car.plate,
									company: car.company,
									model: car.model,
									year: car.year,
									color: car.color,
								},
							},
						},
					],
				},
			},
			include: {
				attempts: {
					include: { car: true },
				},
			},
		});

		return {
			...createdStatement,
			car,
			violation,
		};
	}

	public static async confirm(statement: ConfirmStatementRequestDto) {
		const { images, statementId } = statement;
		const { plate, violation } = await StatementService.getValidatedPlate(images);

		const confirmAttempt = await StatementService.getValidatedConfirmAttempt({
			statement,
			plate,
			violation,
		});

		const existingStatement = (await prisma.statement.findFirst({
			where: {
				id: statementId,
				status: StatementStatus.PENDING,
			},
		})) as Statement;

		const { latitude, longitude, car } = confirmAttempt;
		const location = await LocationService.getAddressFromCoordinates({
			latitude: Number(latitude),
			longitude: Number(longitude),
		});

		return {
			...existingStatement,
			car,
			violation,
			location,
		};
	}

	public static async submit({ statementId, userId }: CancelStatementRequestDto) {
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
						NOT: { plate: null },
						error: null,
					},
					include: {
						car: true,
					},
				},
			},
		});

		if (!existingStatement) {
			throw httpErrors.notFound("Заяву для надсилання не знайдено");
		}

		if (existingStatement.userId !== userId) {
			throw httpErrors.forbidden("Тільки автор заяви може надіслати її");
		}

		const updatedStatement = await prisma.statement.update({
			where: {
				id: statementId,
			},
			data: {
				status: StatementStatus.SUBMITTED,
			},
		});

		const [{ violation, car }] = existingStatement.attempts;

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
						NOT: { plate: null },
						error: null,
					},
					include: {
						car: true,
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

		const [{ violation, plate, car }] = existingStatement.attempts;

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

	public static async getWithDetailsById({ statementId, userId }: CancelStatementRequestDto) {
		const existingStatement = await prisma.statement.findFirst({
			where: {
				id: statementId,
				userId,
			},
			include: {
				attempts: {
					where: {
						NOT: { plate: null },
						error: null,
					},
					include: { car: true },
				},
			},
		});

		if (!existingStatement) {
			throw httpErrors.notFound("Заяву не знайдено");
		}

		const [{ violation }] = existingStatement.attempts;

		return {
			...existingStatement,
			car: existingStatement.attempts[0].car,
			violation,
		};
	}

	public static async getAllWithDetails({ userId }: { userId: string }) {
		const statements = await prisma.statement.findMany({ where: { userId }, select: { id: true } });

		const statementsWithDetails = await Promise.all(
			statements.map(({ id }) => StatementService.getWithDetailsById({ statementId: id, userId })),
		);

		return statementsWithDetails;
	}

	public static async removeById({ statementId, userId }: CancelStatementRequestDto) {
		const existingStatement = await prisma.statement.findFirst({
			where: { id: statementId, userId },
			select: { id: true },
		});

		if (!existingStatement) {
			return null;
		}

		await prisma.statementAttempt.deleteMany({
			where: { statementId },
		});

		const { id } = await prisma.statement.delete({ where: { id: statementId, userId } });

		return { id };
	}

	public static async removeAll({ userId }: { userId: string }) {
		await prisma.statementAttempt.deleteMany({
			where: {
				statement: { userId },
			},
		});

		const statements = await prisma.statement.deleteMany({ where: { userId } });

		return statements.count;
	}
}
