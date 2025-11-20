export type CarApiResponse = {
	digits: string;
	vendor: string;
	model: string;
	model_year: number;
	operations: {
		isLast: boolean;
		color: {
			ua: string;
		};
	}[];
};
