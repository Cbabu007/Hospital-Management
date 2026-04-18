import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getRoomLabel } from "./bedStorage";

export default function ViewBed() {
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

	return (
		<div className="ibm-info-card">
			<h3>View Beds</h3>
			{bookings.length === 0 ? (
				<p>No bed bookings available.</p>
			) : (
				<>
					<div className="ibm-table-toolbar">
						<div className="ibm-search-field">
							<label htmlFor="view-bed-patient-id-search">Enter Patient ID</label>
							<input
								id="view-bed-patient-id-search"
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
								<th>Department</th>
								<th>Doctor</th>
								<th>Room Type</th>
								<th>Room No</th>
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
									<td>{item.department}</td>
									<td>{item.doctor}</td>
									<td>{getRoomLabel(item.bedType)}</td>
									<td>{item.roomNo}</td>
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
