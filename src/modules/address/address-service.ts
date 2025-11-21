import type { Coordinate } from "./types";

export class AddressService {
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

		const distanceLatitude = AddressService.degreeToRadian(endPoint.latitude - startPoint.latitude);
		const distanceLongitude = AddressService.degreeToRadian(
			endPoint.longitude - startPoint.longitude,
		);

		// Haversine formula
		const a =
			Math.sin(distanceLatitude / 2) * Math.sin(distanceLatitude / 2) +
			Math.cos(AddressService.degreeToRadian(startPoint.latitude)) *
				Math.cos(AddressService.degreeToRadian(endPoint.latitude)) *
				Math.sin(distanceLongitude / 2) *
				Math.sin(distanceLongitude / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		const distance = EARTH_RADIUS * c;

		return distance;
	}
}
