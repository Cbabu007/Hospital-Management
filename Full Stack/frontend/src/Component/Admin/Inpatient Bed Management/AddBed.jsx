import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
	BED_TYPES,
	getAvailableRoomNumbers,
	getDepartmentsFromEmployees,
	getDoctorsByDepartment,
} from "./bedStorage";
import {
	addInpatientBooking,
	fetchNextPatientId,
} from "../../../redux/inpatientBedSlice";

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

export default function AddBed() {
	const dispatch = useDispatch();
	const bookings = useSelector((state) => state.inpatientBed.bookings);
	const nextPatientId = useSelector((state) => state.inpatientBed.nextPatientId);
	const employees = useSelector((state) => state.humanResource.employees);
	const [isPatientIdGenerated, setIsPatientIdGenerated] = useState(false);
	const [formData, setFormData] = useState(() => ({
		...INITIAL_FORM,
	}));

	const departments = useMemo(() => getDepartmentsFromEmployees(employees), [employees]);
	const doctors = useMemo(
		() => getDoctorsByDepartment(formData.department, employees),
		[formData.department, employees],
	);
	const roomOptions = useMemo(
		() => (formData.bedType ? getAvailableRoomNumbers(formData.bedType, bookings) : []),
		[formData.bedType, bookings],
	);

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

	const handleGeneratePatientId = async () => {
		if (isPatientIdGenerated) {
			alert("Patient ID already generated for this add");
			return;
		}

		try {
			const generatedId = await dispatch(fetchNextPatientId()).unwrap();
			setFormData((prev) => ({
				...prev,
				patientId: generatedId,
			}));
			setIsPatientIdGenerated(true);
			return;
		} catch (error) {
			alert(error.message || "Unable to generate patient ID");
		}

		setFormData((prev) => ({
			...prev,
			patientId: nextPatientId,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!String(formData.patientId).startsWith("PAT")) {
			alert("Click search icon to generate Patient ID");
			return;
		}

		if (!formData.bedType || !formData.roomNo) {
			alert("Please select room type and room number");
			return;
		}

		const availableRooms = getAvailableRoomNumbers(formData.bedType, bookings);
		const selectedRoomNumber = Number.parseInt(formData.roomNo, 10);
		if (!availableRooms.includes(selectedRoomNumber)) {
			alert("Selected room is already booked. Please choose another room.");
			return;
		}

		const booking = {
			...formData,
			roomNo: selectedRoomNumber,
			createdAt: new Date().toISOString(),
		};

		try {
			await dispatch(addInpatientBooking(booking)).unwrap();
		} catch (error) {
			alert(error.message || "Unable to assign bed");
			return;
		}
		alert("Bed assigned successfully");

		setFormData({
			...INITIAL_FORM,
		});
		setIsPatientIdGenerated(false);
	};

	return (
		<form className="ibm-bed-form" onSubmit={handleSubmit}>
			<h3 className="ibm-form-title">Add Inpatient Bed Entry</h3>

			<div className="ibm-form-grid">
				<div className="ibm-field">
					<label>Patient ID</label>
					<div className="ibm-id-group">
						<input name="patientId" value={formData.patientId} readOnly />
						<button
							type="button"
							className="ibm-id-btn"
							onClick={handleGeneratePatientId}
							aria-label="Generate patient ID"
						>
							<FontAwesomeIcon icon={faSearch} />
						</button>
					</div>
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
						disabled={!formData.bedType || roomOptions.length === 0}
						required
					>
						<option value="">
							{formData.bedType ? "Select Room No" : "Select room type first"}
						</option>
						{roomOptions.map((roomNo) => (
							<option key={roomNo} value={roomNo}>
								{roomNo}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="ibm-form-actions">
				<button type="submit" className="ibm-submit-btn">
					Assign Bed
				</button>
			</div>
		</form>
	);
}
