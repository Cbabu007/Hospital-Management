import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	BED_TYPES,
	getAvailableRoomNumbers,
	getDepartmentsFromEmployees,
	getDoctorsByDepartment,
} from "./bedStorage";
import { updateInpatientBooking } from "../../../redux/inpatientBedSlice";

const INITIAL_FORM = {
	patientId: "",
	patientName: "",
	dateOfBirth: "",
	age: "",
	fatherName: "",
	takeCare: "",
	department: "",
	doctor: "",
	bedType: "",
	roomNo: "",
};

export default function EditBed() {
	const dispatch = useDispatch();
	const bookings = useSelector((state) => state.inpatientBed.bookings);
	const employees = useSelector((state) => state.humanResource.employees);

	const [searchBedType, setSearchBedType] = useState("");
	const [searchRoomNo, setSearchRoomNo] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState("");
	const [formData, setFormData] = useState(INITIAL_FORM);

	const departments = useMemo(() => getDepartmentsFromEmployees(employees), [employees]);
	const doctors = useMemo(
		() => getDoctorsByDepartment(formData.department, employees),
		[formData.department, employees],
	);

	const bookedRoomsForSearchType = useMemo(() => {
		if (!searchBedType) {
			return [];
		}

		const booked = bookings
			.filter((item) => item.bedType === searchBedType)
			.map((item) => Number(item.roomNo))
			.filter((value) => Number.isFinite(value));

		return Array.from(new Set(booked)).sort((a, b) => a - b);
	}, [bookings, searchBedType]);

	useEffect(() => {
		if (!searchBedType || !searchRoomNo) {
			setSelectedPatientId("");
			setFormData(INITIAL_FORM);
			return;
		}

		const found = bookings.find(
			(item) => item.bedType === searchBedType && Number(item.roomNo) === Number(searchRoomNo),
		);

		if (!found) {
			setSelectedPatientId("");
			setFormData(INITIAL_FORM);
			return;
		}

		setSelectedPatientId(found.patientId);
		setFormData({
			patientId: found.patientId || "",
			patientName: found.patientName || "",
			dateOfBirth: found.dateOfBirth || "",
			age: found.age || "",
			fatherName: found.fatherName || "",
			takeCare: found.takeCare || "",
			department: found.department || "",
			doctor: found.doctor || "",
			bedType: found.bedType || "",
			roomNo: String(found.roomNo || ""),
		});
	}, [bookings, searchBedType, searchRoomNo]);

	const roomOptionsForEdit = useMemo(() => {
		if (!formData.bedType) {
			return [];
		}

		const otherBookings = bookings.filter((item) => item.patientId !== selectedPatientId);
		const available = getAvailableRoomNumbers(formData.bedType, otherBookings);
		const currentRoom = Number.parseInt(formData.roomNo, 10);

		if (Number.isFinite(currentRoom) && !available.includes(currentRoom)) {
			available.push(currentRoom);
		}

		return available.sort((a, b) => a - b);
	}, [bookings, formData.bedType, formData.roomNo, selectedPatientId]);

	const handleChange = (event) => {
		const { name, value } = event.target;

		if (name === "dateOfBirth") {
			const dob = new Date(value);
			const today = new Date();
			let age = today.getFullYear() - dob.getFullYear();
			const monthDiff = today.getMonth() - dob.getMonth();
			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
				age -= 1;
			}

			setFormData((prev) => ({
				...prev,
				dateOfBirth: value,
				age: age >= 0 ? String(age) : "",
			}));
			return;
		}

		if (name === "department") {
			setFormData((prev) => ({
				...prev,
				department: value,
				doctor: "",
			}));
			return;
		}

		if (name === "bedType") {
			setFormData((prev) => ({
				...prev,
				bedType: value,
				roomNo: "",
			}));
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!selectedPatientId) {
			alert("Select Type of Room and Room No first");
			return;
		}

		if (!formData.bedType || !formData.roomNo) {
			alert("Please select room type and room number");
			return;
		}

		const selectedRoomNumber = Number.parseInt(formData.roomNo, 10);
		if (!Number.isFinite(selectedRoomNumber)) {
			alert("Invalid room number");
			return;
		}

		try {
			await dispatch(
				updateInpatientBooking({
					originalPatientId: selectedPatientId,
					updatedBooking: {
						...formData,
						roomNo: selectedRoomNumber,
					},
				}),
			).unwrap();
		} catch (error) {
			alert(error.message || "Unable to update bed entry");
			return;
		}

		setSearchBedType(formData.bedType);
		setSearchRoomNo(String(selectedRoomNumber));
		alert("Bed entry updated successfully");
	};

	return (
		<form className="ibm-bed-form" onSubmit={handleSubmit}>
			<h3 className="ibm-form-title">Edit Inpatient Bed Entry</h3>

			<div className="ibm-form-grid">
				<div className="ibm-field">
					<label>Select Type of Room</label>
					<select
						value={searchBedType}
						onChange={(event) => {
							setSearchBedType(event.target.value);
							setSearchRoomNo("");
						}}
					>
						<option value="">Select Room Type</option>
						{BED_TYPES.map((bedType) => (
							<option key={bedType.key} value={bedType.key}>
								{bedType.label}
							</option>
						))}
					</select>
				</div>

				<div className="ibm-field">
					<label>Select Room No</label>
					<select
						value={searchRoomNo}
						onChange={(event) => setSearchRoomNo(event.target.value)}
						disabled={!searchBedType}
					>
						<option value="">Select Room No</option>
						{bookedRoomsForSearchType.map((roomNo) => (
							<option key={roomNo} value={roomNo}>
								{roomNo}
							</option>
						))}
					</select>
				</div>
			</div>

			{selectedPatientId ? (
				<>
					<div className="ibm-form-grid">
						<div className="ibm-field">
							<label>Patient ID</label>
							<input name="patientId" value={formData.patientId} readOnly />
						</div>

						<div className="ibm-field">
							<label>Patient Name</label>
							<input
								name="patientName"
								value={formData.patientName}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="ibm-field">
							<label>Date Of Birth</label>
							<input
								type="date"
								name="dateOfBirth"
								value={formData.dateOfBirth}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="ibm-field">
							<label>Age</label>
							<input name="age" value={formData.age} onChange={handleChange} required />
						</div>

						<div className="ibm-field">
							<label>Father Name</label>
							<input
								name="fatherName"
								value={formData.fatherName}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="ibm-field">
							<label>Take Care</label>
							<input
								name="takeCare"
								value={formData.takeCare}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="ibm-field">
							<label>Department</label>
							<select
								name="department"
								value={formData.department}
								onChange={handleChange}
								required
							>
								<option value="">Select Department</option>
								{departments.map((department) => (
									<option key={department} value={department}>
										{department}
									</option>
								))}
							</select>
						</div>

						<div className="ibm-field">
							<label>Doctor</label>
							<select
								name="doctor"
								value={formData.doctor}
								onChange={handleChange}
								disabled={!formData.department}
								required
							>
								<option value="">Select Doctor</option>
								{doctors.map((doctor) => (
									<option key={doctor.id} value={doctor.name}>
										{doctor.name}
									</option>
								))}
							</select>
						</div>

						<div className="ibm-field">
							<label>Select Types Rooms</label>
							<select
								name="bedType"
								value={formData.bedType}
								onChange={handleChange}
								required
							>
								<option value="">Select Room Type</option>
								{BED_TYPES.map((bedType) => (
									<option key={bedType.key} value={bedType.key}>
										{bedType.label}
									</option>
								))}
							</select>
						</div>

						<div className="ibm-field">
							<label>Select Room No</label>
							<select
								name="roomNo"
								value={formData.roomNo}
								onChange={handleChange}
								disabled={!formData.bedType || roomOptionsForEdit.length === 0}
								required
							>
								<option value="">Select Room No</option>
								{roomOptionsForEdit.map((roomNo) => (
									<option key={roomNo} value={roomNo}>
										{roomNo}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="ibm-form-actions">
						<button type="submit" className="ibm-submit-btn">
							Update Bed Entry
						</button>
					</div>
				</>
			) : (
				<div className="ibm-info-card">
					<p>Select Type of Room and Room No first to load editable details.</p>
				</div>
			)}
		</form>
	);
}
