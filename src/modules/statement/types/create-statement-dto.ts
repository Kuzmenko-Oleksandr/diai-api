import type { MultipartFile } from "@fastify/multipart";

export type CreateStatementDto = {
	images: MultipartFile[];
	longitude: number;
	latitude: number;
	userId: string;
	createdAt: Date;
};
