import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AdminLayout from "../AdminLayout";
import AddEmployee from "./AddEmployee";
import EditEmployee from "./EditEmployee";
import EmployeeList from "./EmployeeList";
import DeleteEmployee from "./DeleteEmployee";
import { fetchEmployees } from "../../../redux/humanResourceSlice";
import "./Human Resources.css";

export default function HumanResources() {
	const actions = ["Add", "Edit", "View", "Delete"];
	const [activeAction, setActiveAction] = useState("Add");
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchEmployees());
	}, [dispatch]);

	const renderContent = () => {
		if (activeAction === "Add") {
			return <AddEmployee />;
		}

		if (activeAction === "Edit") {
			return <EditEmployee />;
		}

		if (activeAction === "View") {
			return <EmployeeList />;
		}

		if (activeAction === "Delete") {
			return <DeleteEmployee />;
		}

		return null;
	};

	return (
		<AdminLayout>
			<section className="hr-page">
				<h2 className="hr-title">Human Resources</h2>

				<div className="hr-nav-container">
					<nav
						className="hr-actions"
						aria-label="Human resources actions"
					>
						{actions.map((action) => (
							<button
								key={action}
								type="button"
								className={`hr-action-btn ${activeAction === action ? "active" : ""}`}
								onClick={() => setActiveAction(action)}
							>
								{action}
							</button>
						))}
					</nav>
				</div>

				<div className="hr-form-container">
					<div className="hr-content">{renderContent()}</div>
				</div>
			</section>
		</AdminLayout>
	);
}
