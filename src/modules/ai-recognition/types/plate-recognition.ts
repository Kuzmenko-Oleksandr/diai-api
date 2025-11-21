import type { Violation } from "../enums/violation";

export type PlateRecognition = {
	index: number;
	filename: string;
	success: boolean;
	plate: string;
	error: string;
	sign: {
		class_name: Violation | null;
	};
};
