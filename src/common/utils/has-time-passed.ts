type Props = {
	startDate: Date;
	endDate: Date;
	milliseconds: number;
};

export const hasTimePassed = ({ startDate, endDate, milliseconds }: Props) => {
	const startTime = startDate.getTime();
	const endTime = endDate.getTime();

	return endTime - startTime >= milliseconds;
};
