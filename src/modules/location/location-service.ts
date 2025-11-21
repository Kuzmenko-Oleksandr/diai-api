import type { Coordinate, LocationApiResponse } from "./types";

type ErrorResponse = {
	error: string;
};

export class LocationService {
	private static apiBaseUrl = "https://nominatim.openstreetmap.org";

	private static degreeToRadian(degree: number) {
		return degree * (Math.PI / 180);
	}

	public static getDistance({
		startPoint,
		endPoint,
	}: {
		startPoint: Coordinate;
		endPoint: Coordinate;
	}) {
		// Radius of the earth in meters
		const EARTH_RADIUS = 6371 * 1000;

		const distanceLatitude = LocationService.degreeToRadian(
			endPoint.latitude - startPoint.latitude,
		);
		const distanceLongitude = LocationService.degreeToRadian(
			endPoint.longitude - startPoint.longitude,
		);

		// Haversine formula
		const a =
			Math.sin(distanceLatitude / 2) * Math.sin(distanceLatitude / 2) +
			Math.cos(LocationService.degreeToRadian(startPoint.latitude)) *
				Math.cos(LocationService.degreeToRadian(endPoint.latitude)) *
				Math.sin(distanceLongitude / 2) *
				Math.sin(distanceLongitude / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		const distance = EARTH_RADIUS * c;

		return distance;
	}

	public static async getAddressFromCoordinates({ latitude, longitude }: Coordinate) {
		const response = await fetch(
			`${LocationService.apiBaseUrl}/reverse?lat=${latitude}&lon=${longitude}&format=json`,
			{
				headers: {
					"User-Agent": "diai-api",
				},
			},
		);

		const data = (await response.json()) as ErrorResponse | LocationApiResponse;

		if ("error" in data) {
			return {
				address: "Не вдалось розпізнати адресу",
				latitude,
				longitude,
			};
		}

		return {
			address: data.display_name,
			latitude,
			longitude,
		};
	}
}
