import ImagePreview from "./ImagePreview";
import "./ImagePreview.css";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteEmployee } from "../../../redux/humanResourceSlice";

const EMPTY_FORM = {
	id: "",
	name: "",
	gender: "",
	dob: "",
	age: "",
	qualification: "",
	regNumber: "",
	experience: "",
	department: "",
	designation: "",
	fee: "",
	mobile: "",
	whatsapp: "",
	altMobile: "",
	email: "",
	addressNo: "",
	street: "",
	nearBy: "",
	city: "",
	district: "",
	state: "",
	nationality: "",
	pincode: "",
	photoPath: "",
	signaturePath: "",
	photoData: "",
	signatureData: "",
	username: "",
	password: "",
	type: "",
};


// Helper to build backend image URL
const getImageUrl = (path) => {
	if (!path) return "";
	if (path.startsWith("http") || path.startsWith("data:image") || path.startsWith("blob:")) return path;
	// Remove /api if present in base URL
	const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/api$/, "");
	// Remove leading backend/src if present
	const rel = path.replace(/^.*uploads[\\/]/, "uploads/");
	return `${base}/${rel}`.replace(/\\/g, "/");
};

export default function DeleteEmployee() {
	const dispatch = useDispatch();
	const employees = useSelector((state) => state.humanResource.employees || []);
	const [type, setType] = useState("");
	const [selectedId, setSelectedId] = useState("");
	const [selectedEmployee, setSelectedEmployee] = useState(EMPTY_FORM);
	const [previewImage, setPreviewImage] = useState("");
	const [previewTitle, setPreviewTitle] = useState("");

	const filteredEmployees = useMemo(() => {
		if (!type) {
			return [];
		}

		return employees.filter((employee) => employee.type === type);
	}, [employees, type]);

	const handleTypeChange = (event) => {
		setType(event.target.value);
		setSelectedId("");
		setSelectedEmployee(EMPTY_FORM);
	};

	const handleEmployeeSelect = (event) => {
		const employeeId = event.target.value;
		setSelectedId(employeeId);

		const employee = filteredEmployees.find((item) => String(item.id) === String(employeeId));
		setSelectedEmployee(employee ? { ...EMPTY_FORM, ...employee } : EMPTY_FORM);
	};

	const handleDelete = async () => {
		if (!selectedId) {
			alert("Please select a person to delete");
			return;
		}

		const isConfirmed = window.confirm("Are you sure you want to delete this employee?");
		if (!isConfirmed) {
			return;
		}

		try {
			await dispatch(deleteEmployee(selectedId)).unwrap();
		} catch (error) {
			alert(error.message || "Unable to delete employee");
			return;
		}

		setSelectedId("");
		setSelectedEmployee(EMPTY_FORM);
		alert("Employee deleted successfully");
	};

	const isDoctor = type === "Doctor";
	const isOthers = type === "Others";

	const openImagePreview = (imageSrc, title) => {
		setPreviewImage(imageSrc);
		setPreviewTitle(title);
	};

	const closeImagePreview = () => {
		setPreviewImage("");
		setPreviewTitle("");
	};

	return (
		<div className="container mt-4">
			<h3 className="text-center mb-4">DELETE HUMAN RESOURCE</h3>

			<div className="row">
				<div className="col-md-4 mb-3">
					<label>Select Type</label>
					<select className="form-control" value={type} onChange={handleTypeChange}>
						<option value="">Select</option>
						<option value="Doctor">Doctor</option>
						<option value="Others">Others</option>
					</select>
				</div>

				<div className="col-md-8 mb-3">
					<label>Select Person (ID - Name)</label>
					<select
						className="form-control"
						value={selectedId}
						onChange={handleEmployeeSelect}
						disabled={!type}
					>
						<option value="">Select</option>
						{filteredEmployees.map((employee) => (
							<option key={employee.id} value={String(employee.id)}>
								{employee.id}-{employee.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{selectedId && (
				<>
					<h5 className="mt-4">Basic Info</h5>
					<div className="row">
						<div className="col-md-4 mb-3"><label>{isDoctor ? "Doctor ID" : isOthers ? "Others ID" : "Staff ID"}</label><input className="form-control" value={selectedEmployee.id} readOnly /></div>
						<div className="col-md-4 mb-3"><label>{isDoctor ? "Doctor Name" : "Staff Name"}</label><input className="form-control" value={selectedEmployee.name} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Gender</label><input className="form-control" value={selectedEmployee.gender} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Date Of Birth</label><input className="form-control" value={selectedEmployee.dob} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Age</label><input className="form-control" value={selectedEmployee.age} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Qualification</label><input className="form-control" value={selectedEmployee.qualification} readOnly /></div>
						{isDoctor && <div className="col-md-4 mb-3"><label>Medical Reg Number</label><input className="form-control" value={selectedEmployee.regNumber} readOnly /></div>}
						<div className="col-md-4 mb-3"><label>Year of Experience</label><input className="form-control" value={selectedEmployee.experience} readOnly /></div>
					</div>

					<h5 className="mt-4">Professional Details</h5>
					<div className="row">
						{isDoctor && <div className="col-md-4 mb-3"><label>Department Name</label><input className="form-control" value={selectedEmployee.department} readOnly /></div>}
						{isDoctor && <div className="col-md-4 mb-3"><label>Doctor Designation</label><input className="form-control" value={selectedEmployee.designation} readOnly /></div>}
						{isDoctor && <div className="col-md-4 mb-3"><label>Consultation Fee</label><input className="form-control" value={selectedEmployee.fee} readOnly /></div>}
						{isOthers && <div className="col-md-4 mb-3"><label>Staff Role</label><input className="form-control" value={selectedEmployee.designation} readOnly /></div>}
					</div>

					<h5 className="mt-4">Contact Details</h5>
					<div className="row">
						<div className="col-md-4 mb-3"><label>Mobile</label><input className="form-control" value={selectedEmployee.mobile} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Whatsapp</label><input className="form-control" value={selectedEmployee.whatsapp} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Alternate Number</label><input className="form-control" value={selectedEmployee.altMobile} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Email</label><input className="form-control" value={selectedEmployee.email} readOnly /></div>
					</div>

					<h5 className="mt-4">Address</h5>
					<div className="row">
						<div className="col-md-4 mb-3"><label>Street No</label><input className="form-control" value={selectedEmployee.addressNo} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Street Name</label><input className="form-control" value={selectedEmployee.street} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Near By</label><input className="form-control" value={selectedEmployee.nearBy} readOnly /></div>
						<div className="col-md-4 mb-3"><label>City</label><input className="form-control" value={selectedEmployee.city} readOnly /></div>
						<div className="col-md-4 mb-3"><label>District</label><input className="form-control" value={selectedEmployee.district} readOnly /></div>
						<div className="col-md-4 mb-3"><label>State</label><input className="form-control" value={selectedEmployee.state} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Nationality</label><input className="form-control" value={selectedEmployee.nationality} readOnly /></div>
						<div className="col-md-4 mb-3"><label>Pincode</label><input className="form-control" value={selectedEmployee.pincode} readOnly /></div>
					</div>

					<h5 className="mt-4">Passport & Signature</h5>
					<div className="row">
						<div className="col-md-4 mb-3">
							<label>Photo</label>
							<ImagePreview
							  src={selectedEmployee.photoData ? selectedEmployee.photoData : getImageUrl(selectedEmployee.photoPath)}
							  alt="Employee photo"
							  size={120}
							/>
						</div>

						<div className="col-md-4 mb-3">
							<label>Signature</label>
							<ImagePreview
							  src={selectedEmployee.signatureData ? selectedEmployee.signatureData : getImageUrl(selectedEmployee.signaturePath)}
							  alt="Employee signature"
							  size={120}
							/>
						</div>
					</div>

					<h5 className="mt-4">Login</h5>
					<div className="row">
						<div className="col-md-4 mb-3">
							<label>Username</label>
							<input className="form-control" value={selectedEmployee.username} readOnly />
						</div>
						<div className="col-md-4 mb-3">
							<label>Password</label>
							<input className="form-control" value={selectedEmployee.password} readOnly />
						</div>
					</div>

					<div className="mt-4">
						<button type="button" className="btn btn-danger" onClick={handleDelete}>
							Delete
						</button>
					</div>
				</>
			)}

			{previewImage && (
				<div
					role="button"
					tabIndex={0}
					onClick={closeImagePreview}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							closeImagePreview();
						}
					}}
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 2000,
						padding: "16px",
					}}
				>
					<div
						style={{
							position: "relative",
							maxWidth: "90vw",
							maxHeight: "90vh",
							background: "#fff",
							borderRadius: "10px",
							padding: "12px",
						}}
						onClick={(event) => event.stopPropagation()}
					>
						<button
							type="button"
							onClick={closeImagePreview}
							style={{
								position: "absolute",
								top: "8px",
								right: "8px",
								border: "none",
								background: "#dc3545",
								color: "#fff",
								width: "30px",
								height: "30px",
								borderRadius: "50%",
								fontWeight: "bold",
								cursor: "pointer",
							}}
						>
							X
						</button>
						<p className="mb-2 mt-1 fw-bold">{previewTitle}</p>
						<img
							src={previewImage}
							alt={previewTitle}
							style={{
								maxWidth: "100%",
								maxHeight: "78vh",
								objectFit: "contain",
								display: "block",
								margin: "0 auto",
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
