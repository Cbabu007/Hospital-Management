import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../AdminLayout";
import { api } from "../../../services/api";
import "./Patient Feedback.css";

const ROWS_PER_PAGE = 4;

const toDateAndTime = (value) => {
	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) {
		return { date: "-", time: "-" };
	}

	const date = parsedDate.toISOString().slice(0, 10);
	const time = parsedDate.toLocaleTimeString("en-IN", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	});

	return { date, time };
};

export default function PatientFeedback() {
	const [selectedDate, setSelectedDate] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [feedbackList, setFeedbackList] = useState([]);

	useEffect(() => {
		const loadFeedback = async () => {
			try {
				const result = await api.get("/patient-feedback");
				setFeedbackList(result);
			} catch {
				setFeedbackList([]);
			}
		};

		loadFeedback();
	}, []);

	const filteredFeedback = useMemo(() => {
		if (!selectedDate) {
			return feedbackList;
		}

		return feedbackList.filter((item) => toDateAndTime(item?.date).date === selectedDate);
	}, [feedbackList, selectedDate]);

	const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / ROWS_PER_PAGE));

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedDate]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedFeedback = useMemo(() => {
		const start = (currentPage - 1) * ROWS_PER_PAGE;
		const end = start + ROWS_PER_PAGE;
		return filteredFeedback.slice(start, end);
	}, [filteredFeedback, currentPage]);

	return (
		<AdminLayout>
			<section className="pf-page">
				<div className="pf-box">
					<h2 className="pf-title">Patient Feedback</h2>

					<div className="pf-filter-row">
						<label htmlFor="feedback-date-filter">Filter By Date</label>
						<input
							id="feedback-date-filter"
							type="date"
							value={selectedDate}
							onChange={(event) => setSelectedDate(event.target.value)}
						/>
					</div>

					<div className="pf-table-wrap">
						<table className="pf-table">
							<thead>
								<tr>
									<th>Date</th>
									<th>Time</th>
									<th>Name</th>
									<th>Phone Number</th>
									<th>Email</th>
									<th>Feedback</th>
								</tr>
							</thead>
							<tbody>
								{filteredFeedback.length === 0 ? (
									<tr>
										<td colSpan={6} className="pf-empty-row">
											No feedback found.
										</td>
									</tr>
								) : (
									paginatedFeedback.map((item, index) => {
										const dateTime = toDateAndTime(item?.date);
										return (
											<tr key={`${item?.name || "feedback"}-${index}`}>
												<td>{dateTime.date}</td>
												<td>{dateTime.time}</td>
												<td>{item?.name || "-"}</td>
												<td>{item?.phone || "-"}</td>
												<td>{item?.email || "-"}</td>
												<td>{item?.feedback || "-"}</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>

					{filteredFeedback.length > 0 ? (
						<div className="pf-pagination">
							<button
								type="button"
								className="pf-page-btn"
								onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
								disabled={currentPage === 1}
							>
								Prev
							</button>
							<span className="pf-page-text">Page {currentPage} of {totalPages}</span>
							<button
								type="button"
								className="pf-page-btn"
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
