export type CreateStatementDto = {
	images: Buffer[];
	longitude: number;
	latitude: number;
	userId: string;
	createdAt: Date;
};
