import { httpErrors } from "@fastify/sensible";
import type { Car, CarApiResponse } from "./types";

type ErrorResponse = {
	error: string;
};

export class CarService {
	private static apiBaseUrl = "https://baza-gai.com.ua/api";

	public static async getDetails(number: Car["number"]) {
		const response = await fetch(`${CarService.apiBaseUrl}/nomer/${number}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Api-Key": process.env.BG_CARS_API_KEY ?? "",
			},
		});

		const details = (await response.json()) as CarApiResponse | ErrorResponse;

		if ("error" in details) {
			throw httpErrors.badRequest(details.error);
		}

		const mappedDetails: Car = {
			...details,
			year: details.model_year,
			company: details.vendor,
			number: details.digits,
		};

		return mappedDetails;
	}
}
