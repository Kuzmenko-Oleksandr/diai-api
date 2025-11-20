import { randomUUID } from "node:crypto";
import { httpErrors } from "@fastify/sensible";
import type { PlateRecognition } from "./types";

type ErrorResponse = {
	detail: string | { msg: string }[];
};

type SuccessResponse = {
	results: PlateRecognition[];
};

export class AiRecognitionService {
	private static apiBaseUrl = "https://pzjururmgg.eu-west-1.awsapprunner.com";

	public static async getPlateDetails(files: Buffer[]) {
		const form = new FormData();

		for (const file of files) {
			form.append("images", new Blob([file]), `${randomUUID()}.png`);
		}

		const response = await fetch(`${AiRecognitionService.apiBaseUrl}/plates/recognize-two`, {
			method: "POST",
			body: form,
		});

		const plateDetails = (await response.json()) as ErrorResponse | SuccessResponse;

		if ("detail" in plateDetails) {
			const { detail } = plateDetails;
			const errorMessage = Array.isArray(detail) ? detail[0].msg : detail;

			throw httpErrors.badRequest(errorMessage);
		}

		return plateDetails;
	}

	public static async getViolation() {}
}
