import ImagePreview from "./ImagePreview";
import "./ImagePreview.css";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateEmployee } from "../../../redux/humanResourceSlice";

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
};

const convertToDataUrl = (file) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => resolve(reader.result);
	reader.onerror = () => reject(new Error("file-read-failed"));
	reader.readAsDataURL(file);
});


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

const calculateAgeFromDob = (dobValue) => {
	if (!dobValue) {
		return "";
	}

	const birthDate = new Date(dobValue);
	if (Number.isNaN(birthDate.getTime())) {
		return "";
	}

	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age -= 1;
	}

	return age < 0 ? "" : String(age);
};

export default function EditEmployee() {
	const dispatch = useDispatch();
	const employees = useSelector((state) => state.humanResource.employees || []);

	const [type, setType] = useState("");
	const [selectedId, setSelectedId] = useState("");
	const [formData, setFormData] = useState(EMPTY_FORM);
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
		setFormData(EMPTY_FORM);
	};

	const handleEmployeeSelect = (event) => {
		const employeeId = event.target.value;
		setSelectedId(employeeId);

		const selectedEmployee = filteredEmployees.find((employee) => employee.id === employeeId);
		if (!selectedEmployee) {
			setFormData(EMPTY_FORM);
			return;
		}

		const mergedData = { ...EMPTY_FORM, ...selectedEmployee };
		setFormData({ ...mergedData, age: calculateAgeFromDob(mergedData.dob) || mergedData.age });
	};

	const handleChange = (event) => {
		const { name, value } = event.target;

		if (name === "dob") {
			setFormData((prev) => ({ ...prev, dob: value, age: calculateAgeFromDob(value) }));
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileNameChange = async (event, pathFieldName, dataFieldName) => {
		const file = event.target.files?.[0];

		if (!file) {
			setFormData((prev) => ({ ...prev, [pathFieldName]: "", [dataFieldName]: "" }));
			return;
		}

		try {
			const dataUrl = await convertToDataUrl(file);
			setFormData((prev) => ({ ...prev, [pathFieldName]: file.name, [dataFieldName]: dataUrl }));
		} catch {
			setFormData((prev) => ({ ...prev, [pathFieldName]: file.name, [dataFieldName]: "" }));
		}
	};

	const handleUpdate = async (event) => {
		event.preventDefault();

		if (!selectedId) {
			alert("Please select a person to edit");
			return;
		}

		try {
			await dispatch(updateEmployee({ ...formData, type })).unwrap();
			alert("Employee details updated successfully");
		} catch (error) {
			alert(error.message || "Unable to update employee");
		}
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
			<h3 className="text-center mb-4">EDIT HUMAN RESOURCE</h3>

			<form onSubmit={handleUpdate} autoComplete="off">
				<div className="row">
					<div className="col-md-4 mb-3">
						<label>Select Type</label>
						<select
							className="form-control"
							onChange={handleTypeChange}
							value={type}
						>
							<option value="">Select</option>
							<option value="Doctor">Doctor</option>
							<option value="Others">Others</option>
						</select>
					</div>

					<div className="col-md-8 mb-3">
						<label>Select Person (ID - Name)</label>
						<select
							className="form-control"
							onChange={handleEmployeeSelect}
							value={selectedId}
							disabled={!type}
						>
							<option value="">Select</option>
							{filteredEmployees.map((employee) => (
								<option
									key={employee.id}
									value={employee.id}
								>
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
							<div className="col-md-4 mb-3">
								<label>{isDoctor ? "Doctor ID" : "Others ID"}</label>
								<input
									type="text"
									name="id"
									className="form-control"
									value={formData.id}
									readOnly
								/>
							</div>

							<div className="col-md-4 mb-3">
								<label>{isDoctor ? "Doctor Name" : "Staff Name"}</label>
								<input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
							</div>

							<div className="col-md-4 mb-3">
								<label>Gender</label>
								<select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
									<option value="">Select</option>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
									<option value="Third Gender">Third Gender</option>
								</select>
							</div>

							<div className="col-md-4 mb-3">
								<label>Date Of Birth</label>
								<input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} />
							</div>

							<div className="col-md-4 mb-3">
								<label>Age</label>
								<input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} readOnly />
							</div>

							<div className="col-md-4 mb-3">
								<label>Qualification</label>
								<input type="text" name="qualification" className="form-control" value={formData.qualification} onChange={handleChange} />
							</div>

							{isDoctor && (
								<div className="col-md-4 mb-3">
									<label>Medical Reg Number</label>
									<input type="text" name="regNumber" className="form-control" value={formData.regNumber} onChange={handleChange} />
								</div>
							)}

							<div className="col-md-4 mb-3">
								<label>Year of Experience</label>
								<input type="text" name="experience" className="form-control" value={formData.experience} onChange={handleChange} />
							</div>
						</div>

						{isDoctor && (
							<>
								<h5 className="mt-4">Professional Details</h5>
								<div className="row">
									<div className="col-md-4 mb-3">
										<label>Department Name</label>
										<input type="text" name="department" className="form-control" value={formData.department} onChange={handleChange} />
									</div>
									<div className="col-md-4 mb-3">
										<label>Doctor Designation</label>
										<input type="text" name="designation" className="form-control" value={formData.designation} onChange={handleChange} />
									</div>
									<div className="col-md-4 mb-3">
										<label>Consultation Fee</label>
										<input type="number" name="fee" className="form-control" value={formData.fee} onChange={handleChange} />
									</div>
								</div>
							</>
						)}

						{isOthers && (
							<>
								<h5 className="mt-4">Professional Details</h5>
								<div className="row">
									<div className="col-md-4 mb-3">
										<label>Select Type</label>
										<input type="text" name="designation" className="form-control" value={formData.designation} onChange={handleChange} />
									</div>
								</div>
							</>
						)}

						<h5 className="mt-4">Contact Details</h5>
						<div className="row">
							<div className="col-md-4 mb-3">
								<label>Mobile</label>
								<input type="text" name="mobile" className="form-control" value={formData.mobile} onChange={handleChange} />
							</div>
							<div className="col-md-4 mb-3">
								<label>Whatsapp</label>
								<input type="text" name="whatsapp" className="form-control" value={formData.whatsapp} onChange={handleChange} />
							</div>
							<div className="col-md-4 mb-3">
								<label>Alternate Number</label>
								<input type="text" name="altMobile" className="form-control" value={formData.altMobile} onChange={handleChange} />
							</div>
							<div className="col-md-4 mb-3">
								<label>Email</label>
								<input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
							</div>
						</div>

						<h5 className="mt-4">Address</h5>
						<div className="row">
							<div className="col-md-4 mb-3"><label>Street No</label><input type="text" name="addressNo" className="form-control" value={formData.addressNo} onChange={handleChange} /></div>
							<div className="col-md-4 mb-3"><label>Street Name</label><input type="text" name="street" className="form-control" value={formData.street} onChange={handleChange} /></div>
							<div className="col-md-4 mb-3"><label>Near By</label><input type="text" name="nearBy" className="form-control" value={formData.nearBy} onChange={handleChange} /></div>
							<div className="col-md-4 mb-3"><label>City</label><input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} /></div>
							<div className="col-md-4 mb-3"><label>District</label><input type="text" name="district" className="form-control" value={formData.district} onChange={handleChange} /></div>
							<div className="col-md-4 mb-3"><label>State</label><input type="text" name="state" className="form-control" value={formData.state} onChange={handleChange} /></div>
							<div className="col-md-4 mb-3"><label>Nationality</label><input type="text" name="nationality" className="form-control" value={formData.nationality} onChange={handleChange} /></div>
							<div className="col-md-4 mb-3"><label>Pincode</label><input type="text" name="pincode" className="form-control" value={formData.pincode} onChange={handleChange} /></div>
						</div>

						<h5 className="mt-4">Passport & Signature</h5>
						<div className="row">
							<div className="col-md-4 mb-3">
								<label>Photo</label>
								<input type="file" className="form-control" onChange={(event) => handleFileNameChange(event, "photoPath", "photoData")} />
								<ImagePreview
								  src={formData.photoData ? formData.photoData : getImageUrl(formData.photoPath)}
								  alt="Employee photo"
								  size={120}
								/>
							</div>
							<div className="col-md-4 mb-3">
								<label>Signature</label>
								<input type="file" className="form-control" onChange={(event) => handleFileNameChange(event, "signaturePath", "signatureData")} />
								<ImagePreview
								  src={formData.signatureData ? formData.signatureData : getImageUrl(formData.signaturePath)}
								  alt="Employee signature"
								  size={120}
								/>
							</div>
						</div>

						<h5 className="mt-4">Login</h5>
						<div className="row">
							<div className="col-md-4 mb-3"><label>Username</label><input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} /></div>
							<div className="col-md-4 mb-3"><label>Password</label><input type="text" name="password" className="form-control" value={formData.password} onChange={handleChange} /></div>
						</div>

						<div className="mt-4">
							<button className="btn btn-primary me-3">Update</button>
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
			</form>
		</div>
	);
}
