export const BED_BOOKINGS_KEY = "inpatientBedBookings";
export const PATIENT_COUNTER_KEY = "inpatientPatientIdLastSaved";

export const BED_TYPES = [
	{
		key: "singleAc",
		label: "Single AC Room Beds Available",
		total: 5,
		color: "green",
	},
	{
		key: "doubleAc",
		label: "Double AC Room Beds Available",
		total: 5,
		color: "green",
	},
	{
		key: "generalAc",
		label: "General AC Room Beds Available",
		total: 10,
		color: "green",
	},
	{
		key: "singleNonAc",
		label: "Single Non AC Rooms Beds Available",
		total: 5,
		color: "red",
	},
	{
		key: "doubleNonAc",
		label: "Double Non AC Beds Available",
		total: 5,
		color: "red",
	},
	{
		key: "generalNonAc",
		label: "General Non AC Beds Available",
		total: 20,
		color: "red",
	},
];

export const getBedTypeByKey = (bedTypeKey) => {
	return BED_TYPES.find((item) => item.key === bedTypeKey) || null;
};

export const getBookedRoomSet = (bedTypeKey, bookings = []) => {
	return new Set(
		bookings
			.filter((item) => item.bedType === bedTypeKey)
			.map((item) => Number(item.roomNo))
			.filter((value) => Number.isFinite(value)),
	);
};

export const getAvailableRoomNumbers = (bedTypeKey, bookings = []) => {
	const bedType = getBedTypeByKey(bedTypeKey);
	if (!bedType) {
		return [];
	}

	const bookedSet = getBookedRoomSet(bedTypeKey, bookings);
	const available = [];

	for (let i = 1; i <= bedType.total; i += 1) {
		if (!bookedSet.has(i)) {
			available.push(i);
		}
	}

	return available;
};

export const getAvailability = (bookings = []) => {
	return BED_TYPES.map((bedType) => ({
		...bedType,
		available: getAvailableRoomNumbers(bedType.key, bookings).length,
	}));
};

export const getDepartmentsFromEmployees = (employees = []) => {
	const departmentSet = new Set();

	employees.forEach((employee) => {
		if (employee?.department) {
			departmentSet.add(employee.department);
		}
	});

	return Array.from(departmentSet).sort((a, b) => a.localeCompare(b));
};

export const getDoctorsByDepartment = (department, employees = []) => {
	if (!department) {
		return [];
	}

	return employees.filter(
		(employee) => employee?.type === "Doctor" && employee?.department === department,
	);
};

export const getRoomLabel = (bedTypeKey) => {
	const found = BED_TYPES.find((item) => item.key === bedTypeKey);
	return found ? found.label : "Unknown";
};
