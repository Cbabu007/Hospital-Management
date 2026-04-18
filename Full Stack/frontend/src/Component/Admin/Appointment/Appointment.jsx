import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../AdminLayout";
import { api } from "../../../services/api";
import "./Appointment.css";
const ROWS_PER_PAGE = 4;

const getDateString = (value) => {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return "-";
	}

	return parsed.toISOString().slice(0, 10);
};

const getTimeString = (value) => {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return "-";
	}

	return parsed.toLocaleTimeString("en-IN", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	});
};

export default function Appointment() {
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedAction, setSelectedAction] = useState("All");
	const [currentPage, setCurrentPage] = useState(1);
	const [appointments, setAppointments] = useState([]);

	useEffect(() => {
		const loadAppointments = async () => {
			try {
				const result = await api.get("/appointments");
				setAppointments(result);
			} catch {
				setAppointments([]);
			}
		};

		loadAppointments();
	}, []);

	const filteredAppointments = useMemo(() => {
		if (!selectedDate) {
			return appointments;
		}

		return appointments.filter((item) => {
			const dateValue = item?.date || item?.created;
			return getDateString(dateValue) === selectedDate;
		});
	}, [appointments, selectedDate]);

	const actionFilteredAppointments = useMemo(() => {
		if (selectedAction === "All") {
			return filteredAppointments;
		}

		return filteredAppointments.filter((item) => {
			const status = item?.status || "Conform Book";
			return String(status) === selectedAction;
		});
	}, [filteredAppointments, selectedAction]);

	const totalPages = Math.max(1, Math.ceil(actionFilteredAppointments.length / ROWS_PER_PAGE));

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedDate, selectedAction]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedAppointments = useMemo(() => {
		const start = (currentPage - 1) * ROWS_PER_PAGE;
		const end = start + ROWS_PER_PAGE;
		return actionFilteredAppointments.slice(start, end);
	}, [actionFilteredAppointments, currentPage]);

	const updateStatus = async (appointment, status) => {
		if (!appointment?._id) {
			return;
		}

		try {
			const updated = await api.patch(`/appointments/${appointment._id}/status`, { status });
			setAppointments((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
		} catch (error) {
			alert(error.message || "Unable to update appointment status");
		}
	};

	return (
		<AdminLayout>
			<section className="ap-page">
				<div className="ap-box">
					<h2 className="ap-title">Appointment</h2>

					<div className="ap-filter-row">
						<div className="ap-filter-left">
							<label htmlFor="appointment-action-filter">Select Action</label>
							<select
								id="appointment-action-filter"
								value={selectedAction}
								onChange={(event) => setSelectedAction(event.target.value)}
							>
								<option value="All">All</option>
								<option value="Conform Book">Conform Book</option>
								<option value="Booked">Booked</option>
								<option value="Cancelled">Cancelled</option>
							</select>
						</div>

						<div className="ap-filter-right">
							<label htmlFor="appointment-date-filter">Filter By Date</label>
							<input
								id="appointment-date-filter"
								type="date"
								value={selectedDate}
								onChange={(event) => setSelectedDate(event.target.value)}
							/>
						</div>
					</div>

					<div className="ap-table-wrap">
						<table className="ap-table">
							<thead>
								<tr>
									<th>Date</th>
									<th>Time</th>
									<th>Name</th>
									<th>Mobile</th>
									<th>Email</th>
									<th>Department</th>
									<th>Doctor Name</th>
									<th>Message</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{actionFilteredAppointments.length === 0 ? (
									<tr>
										<td colSpan={9} className="ap-empty-row">No appointments found.</td>
									</tr>
								) : (
									paginatedAppointments.map((item) => {
										const status = item?.status || "Conform Book";

										return (
											<tr key={item._id || item.created}>
												<td>{getDateString(item?.date || item?.created)}</td>
												<td>{getTimeString(item?.created)}</td>
												<td>{item?.name || "-"}</td>
												<td>{item?.mobile || "-"}</td>
												<td>{item?.email || "-"}</td>
												<td>{item?.doctorDept || "-"}</td>
												<td>{item?.doctorName || "-"}</td>
												<td>{item?.message || "-"}</td>
												<td className="ap-action-cell">
													<button
														type="button"
														className={`ap-status-btn ${status === "Booked" ? "booked" : status === "Cancelled" ? "cancelled" : "confirm"}`}
														onClick={() => updateStatus(item, "Booked")}
														disabled={status === "Booked"}
													>
														{status === "Booked" ? "Booked" : status === "Cancelled" ? "Cancelled" : "Conform Book"}
													</button>
													<button
														type="button"
														className="ap-cancel-icon-btn"
														onClick={() => updateStatus(item, "Cancelled")}
														aria-label="Cancel booking"
													>
														<i className="fa-solid fa-trash" aria-hidden="true" />
													</button>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>

					{actionFilteredAppointments.length > 0 ? (
						<div className="ap-pagination">
							<button
								type="button"
								className="ap-page-btn"
								onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
								disabled={currentPage === 1}
							>
								Prev
							</button>
							<span className="ap-page-text">Page {currentPage} of {totalPages}</span>
							<button
								type="button"
								className="ap-page-btn"
								onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
								disabled={currentPage === totalPages}
							>
								Next
							</button>
						</div>
					) : null}
				</div>
			</section>
		</AdminLayout>
	);
}
