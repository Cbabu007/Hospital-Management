import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../AdminLayout";
import HomeBed from "./HomeBed";
import AddBed from "./AddBed";
import EditBed from "./EditBed";
import ViewBed from "./ViewBed";
import DeleteBed from "./DeleteBed";
import { fetchPublicDoctors } from "../../../redux/humanResourceSlice";
import { fetchInpatientBookings } from "../../../redux/inpatientBedSlice";
import "./Inpatient Bed Management.css";

export default function InpatientBedManagement() {
	const actions = ["Home", "Add", "Edit", "View", "Delete"];
	const [activeAction, setActiveAction] = useState("Home");
	const dispatch = useDispatch();
	const bookings = useSelector((state) => state.inpatientBed.bookings || []);
	const employees = useSelector((state) => state.humanResource.employees || []);

	useEffect(() => {
		if (!bookings.length) {
			dispatch(fetchInpatientBookings());
		}

		if (!employees.length) {
			dispatch(fetchPublicDoctors());
		}
	}, [bookings.length, dispatch, employees.length]);

	const renderContent = () => {
		if (activeAction === "Home") {
			return <HomeBed />;
		}

		if (activeAction === "Add") {
			return <AddBed />;
		}

		if (activeAction === "Edit") {
			return <EditBed />;
		}

		if (activeAction === "View") {
			return <ViewBed />;
		}

		if (activeAction === "Delete") {
			return <DeleteBed />;
		}

		return null;
	};

	return (
		<AdminLayout>
			<section className="ibm-page">
				
				<div className="ibm-nav-container">
					<nav
						className="ibm-actions"
						aria-label="Inpatient bed management actions"
					>
						{actions.map((action) => (
							<button
								key={action}
								type="button"
								className={`ibm-action-btn ${activeAction === action ? "active" : ""}`}
								onClick={() => setActiveAction(action)}
							>
								{action}
							</button>
						))}
					</nav>
				</div>

				<div className="ibm-form-container">
					<div className="ibm-content">{renderContent()}</div>
				</div>
			</section>
		</AdminLayout>
	);
}
