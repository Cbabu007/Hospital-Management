import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteInpatientBooking } from "../../../redux/inpatientBedSlice";
import { getRoomLabel } from "./bedStorage";

export default function DeleteBed() {
	const dispatch = useDispatch();
	const bookings = useSelector((state) => state.inpatientBed.bookings);
	const [patientIdQuery, setPatientIdQuery] = useState("");

	const filteredBookings = useMemo(() => {
		const query = patientIdQuery.trim().toLowerCase();
		if (!query) {
			return bookings;
		}

		return bookings.filter((item) =>
			String(item.patientId || "").toLowerCase().includes(query),
		);
	}, [bookings, patientIdQuery]);

	const handleDelete = async (patientId) => {
		if (!window.confirm("Delete this bed allocation?")) {
			return;
		}

		try {
			await dispatch(deleteInpatientBooking(patientId)).unwrap();
		} catch (error) {
			alert(error.message || "Unable to delete booking");
		}
	};

	return (
		<div className="ibm-info-card">
			<h3>Delete Beds</h3>
			{bookings.length === 0 ? (
				<p>No bed bookings available to delete.</p>
			) : (
				<>
					<div className="ibm-table-toolbar">
						<div className="ibm-search-field">
							<label htmlFor="delete-bed-patient-id-search">Enter Patient ID</label>
							<input
								id="delete-bed-patient-id-search"
								type="text"
								value={patientIdQuery}
								onChange={(event) => setPatientIdQuery(event.target.value)}
								placeholder="PAT100001"
							/>
						</div>
					</div>
					<div className="ibm-table-wrap">
						<table className="ibm-table">
						<thead>
							<tr>
								<th>Patient ID</th>
								<th>Patient Name</th>
								<th>Father Name</th>
								<th>Take Care</th>
								<th>Age</th>
								<th>Room Type</th>
								<th>Room No</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{filteredBookings.map((item) => (
								<tr key={item.patientId}>
									<td>{item.patientId}</td>
									<td>{item.patientName}</td>
									<td>{item.fatherName}</td>
									<td>{item.takeCare}</td>
									<td>{item.age}</td>
									<td>{getRoomLabel(item.bedType)}</td>
									<td>{item.roomNo}</td>
									<td>
										<button
											type="button"
											className="ibm-delete-btn"
											onClick={() => handleDelete(item.patientId)}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
						{filteredBookings.length === 0 ? (
							<p className="ibm-empty-note">No patient found for this ID.</p>
						) : null}
				</div>
				</>
			)}
		</div>
	);
}
