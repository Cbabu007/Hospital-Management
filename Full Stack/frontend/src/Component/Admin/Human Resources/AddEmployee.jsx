import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addEmployee } from "../../../redux/humanResourceSlice";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const INITIAL_FORM_DATA = {
id:"",
name:"",
gender:"",
dob:"",
age:"",
qualification:"",
regNumber:"",
experience:"",
department:"",
designation:"",
fee:"",
mobile:"",
whatsapp:"",
altMobile:"",
email:"",
addressNo:"",
street:"",
nearBy:"",
city:"",
district:"",
state:"",
nationality:"",
pincode:"",
photoPath:"",
signaturePath:"",
photoData:"",
signatureData:"",
username:"",
password:""
}

const AddEmployee = () => {

const dispatch = useDispatch();
const employees = useSelector((state) => state.humanResource.employees || []);

const [type,setType] = useState("");
const [photoPreview,setPhotoPreview] = useState(null);
const [signPreview,setSignPreview] = useState(null);
const [previewImage,setPreviewImage] = useState("");
const [previewTitle,setPreviewTitle] = useState("");
const [isStaffIdGenerated, setIsStaffIdGenerated] = useState(false);
const formRef = useRef(null);
const photoInputRef = useRef(null);
const signInputRef = useRef(null);

const [formData,setFormData] = useState(INITIAL_FORM_DATA);
const isDoctor = type === "Doctor";
const isOthers = type === "Others";
const photoPreviewSrc = photoPreview || formData.photoData;
const signPreviewSrc = signPreview || formData.signatureData;

const isImageSrc = (value) => {
if (!value) {
return false
}

return value.startsWith("data:image") || value.startsWith("blob:") || value.startsWith("http")
}

const calculateAgeFromDob = (dobValue) => {
if (!dobValue) {
return ""
}

const birthDate = new Date(dobValue)
if (Number.isNaN(birthDate.getTime())) {
return ""
}

const today = new Date()
let age = today.getFullYear() - birthDate.getFullYear()
const monthDiff = today.getMonth() - birthDate.getMonth()

if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
age -= 1
}

return age < 0 ? "" : String(age)
}

const extractNumericId = (id, prefix) => {
if (typeof id !== "string" || !id.startsWith(prefix)) {
return null
}

const value = parseInt(id.slice(prefix.length), 10)
return Number.isNaN(value) ? null : value
}

const getStoredLastIdNumber = (prefix) => {
	const fromCounter = 100000
	const fromEmployees = employees.reduce((max, employee) => {
const parsed = extractNumericId(employee?.id, prefix)
if (parsed === null) {
return max
}

return Math.max(max, parsed)
}, 0)

return Math.max(fromCounter, fromEmployees, 100000)
}

const convertToDataUrl = (file) => new Promise((resolve, reject) => {
const reader = new FileReader()
reader.onload = () => resolve(reader.result)
reader.onerror = () => reject(new Error("file-read-failed"))
reader.readAsDataURL(file)
})

const getNextPrefixedId = (prefix) => {
	const lastNumber = getStoredLastIdNumber(prefix)
const nextNumber = lastNumber + 1

return `${prefix}${nextNumber}`
}

const clearPreviews = () => {
setPhotoPreview(null)
setSignPreview(null)
setFormData((prev) => ({
	...prev,
	photoPath: "",
	signaturePath: "",
	photoData: "",
	signatureData: "",
}))

if (photoInputRef.current) {
photoInputRef.current.value = ""
}

if (signInputRef.current) {
signInputRef.current.value = ""
}
}

const hidePreviewOnly = () => {
setPhotoPreview(null)
setSignPreview(null)

if (photoInputRef.current) {
photoInputRef.current.value = ""
}

if (signInputRef.current) {
signInputRef.current.value = ""
}
}

const openImagePreview = (imageSrc, title) => {
setPreviewImage(imageSrc)
setPreviewTitle(title)
}

const closeImagePreview = () => {
setPreviewImage("")
setPreviewTitle("")
}

const handleChange=(e)=>{
const { name, value } = e.target

if (name === "dob") {
setFormData((prev) => ({ ...prev, dob: value, age: calculateAgeFromDob(value) }))
} else {
setFormData((prev) => ({ ...prev, [name]: value }))
}

if (e.target.tagName === "SELECT") {
hidePreviewOnly()
}
}

const handleTypeChange=(e)=>{
setType(e.target.value)
setFormData(INITIAL_FORM_DATA)
setIsStaffIdGenerated(false)
clearPreviews()
}

const handleGenerateStaffId = () => {
if (type !== "Doctor" && type !== "Others") {
alert("Please select Doctor or Others type to generate Staff ID")
return
}

if (isStaffIdGenerated) {
alert("Staff ID already generated for this add")
return
}

if (type === "Doctor") {
const nextDoctorId = getNextPrefixedId("DR")
setFormData((prev) => ({
	...prev,
	id: nextDoctorId,
	username: nextDoctorId,
	password: `${nextDoctorId}_1`,
}))
setIsStaffIdGenerated(true)
return
}

const nextOtherId = getNextPrefixedId("OTH")
setFormData((prev) => ({
	...prev,
	id: nextOtherId,
	username: nextOtherId,
	password: `${nextOtherId}_1`,
}))
setIsStaffIdGenerated(true)
}

const handlePhoto = (e) => {
	const file = e.target.files[0];
	if (!file) {
		setPhotoPreview(null);
		setFormData((prev) => ({ ...prev, photoFile: null, photoPath: "" }));
		return;
	}
	setPhotoPreview(URL.createObjectURL(file));
	setFormData((prev) => ({ ...prev, photoFile: file, photoPath: file.name }));
};

const handleSign = (e) => {
	const file = e.target.files[0];
	if (!file) {
		setSignPreview(null);
		setFormData((prev) => ({ ...prev, signFile: null, signaturePath: "" }));
		return;
	}
	setSignPreview(URL.createObjectURL(file));
	setFormData((prev) => ({ ...prev, signFile: file, signaturePath: file.name }));
};



async function handleSubmit(e) {
	e.preventDefault();
	if (type === "Doctor" && !String(formData.id).startsWith("DR")) {
		alert("Click search icon to generate Doctor ID");
		return;
	}
	if (type === "Others" && !String(formData.id).startsWith("OTH")) {
		alert("Click search icon to generate Others ID");
		return;
	}
	// Prepare FormData for file upload
	const form = new FormData();
	form.append("id", formData.id);
	form.append("type", type);
	form.append("name", formData.name);
	form.append("gender", formData.gender);
	form.append("dob", formData.dob);
	form.append("age", formData.age);
	form.append("qualification", formData.qualification);
	form.append("regNumber", formData.regNumber);
	form.append("experience", formData.experience);
	form.append("department", formData.department);
	form.append("designation", formData.designation);
	form.append("fee", formData.fee);
	form.append("mobile", formData.mobile);
	form.append("whatsapp", formData.whatsapp);
	form.append("altMobile", formData.altMobile);
	form.append("email", formData.email);
	form.append("addressNo", formData.addressNo);
	form.append("street", formData.street);
	form.append("nearBy", formData.nearBy);
	form.append("city", formData.city);
	form.append("district", formData.district);
	form.append("state", formData.state);
	form.append("nationality", formData.nationality);
	form.append("pincode", formData.pincode);
	form.append("username", formData.username);
	form.append("password", formData.password);
	if (formData.photoFile) form.append("photo", formData.photoFile);
	if (formData.signFile) form.append("sign", formData.signFile);
	try {
		await dispatch(addEmployee(form)).unwrap();
	} catch (error) {
		alert(error.message || "Unable to add employee");
		return;
	}
	alert("Employee Added Successfully");
	resetForm();
}

const resetForm=()=>{
if (formRef.current) {
formRef.current.reset()
}

setFormData(INITIAL_FORM_DATA)
setType("")
setIsStaffIdGenerated(false)
clearPreviews()
}

return (

<div className="container mt-4">

<h3 className="text-center mb-4">ADD HUMAN RESOURCE</h3>

<form ref={formRef} onSubmit={handleSubmit} autoComplete="off">

<div className="mb-3">
<label>Select Type</label>
<select className="form-control" onChange={handleTypeChange} value={type}>
<option value="">Select</option>
<option value="Doctor">Doctor</option>
<option value="Others">Others</option>
</select>
</div>

{(isDoctor || isOthers) && (
	<>

{/* BASIC INFO */}

<h5 className="mt-4">Basic Info</h5>

<div className="row">

<div className="col-md-4 mb-3">
<label>{isDoctor ? "Doctor ID" : isOthers ? "Others ID" : "Staff ID"}</label>
<div className="input-group">
<input type="text" name="id" className="form-control" onChange={handleChange} value={formData.id} readOnly={isDoctor || isOthers}/>
<button type="button" className="input-group-text" onClick={handleGenerateStaffId}>
<FontAwesomeIcon icon={faSearch}/>
</button>
</div>
</div>

<div className="col-md-4 mb-3">
<label>{isDoctor ? "Doctor Name" : "Staff Name"}</label>
<input type="text" name="name" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Gender</label>
<select className="form-control" name="gender" onChange={handleChange}>
<option>Select</option>
<option>Male</option>
<option>Female</option>
<option>Third Gender</option>
</select>
</div>

<div className="col-md-4 mb-3">
<label>Date Of Birth</label>
<input type="date" name="dob" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Age</label>
<input type="number" name="age" className="form-control" onChange={handleChange} value={formData.age} readOnly/>
</div>

<div className="col-md-4 mb-3">
<label>Qualication</label>
<input type="text" name="qualification" className="form-control" onChange={handleChange}/>
</div>

{isDoctor && (
<div className="col-md-4 mb-3">
<label>Medical Reg Number</label>
<input type="text" name="regNumber" className="form-control" onChange={handleChange}/>
</div>
)}

<div className="col-md-4 mb-3">
<label>Year of Experience</label>
<input type="text" name="experience" className="form-control" onChange={handleChange}/>
</div>

</div>

{/* DOCTOR DETAILS */}

{isDoctor && (

<>

<h5 className="mt-4">Professional Details</h5>

<div className="row">

<div className="col-md-4 mb-3">
<label>Department Name</label>
<select name="department" className="form-control" onChange={handleChange}>
<option value="">Select Type</option>
<option>General Medicine</option>
<option>General Surgery</option>
<option>Pediatrics</option>
<option>Gynecology & Obstetrics</option>
<option>Orthopedics</option>
<option>Cardiology</option>
<option>Neurology</option>
<option>Dermatology</option>
<option>ENT</option>
<option>Opthalmology(Eye)</option>
<option>Psychiatry</option>
<option>Pulmonology (Chest)</option>
<option>Gastroenterology</option>
<option>Nephrology</option>
<option>Urology</option>
<option>Endocrinology</option>
<option>Oncology</option>
</select>
</div>

<div className="col-md-4 mb-3">
<label>Doctor Designation</label>
<select name="designation" className="form-control" onChange={handleChange}>
<option value="">Select Type</option>
<option>Junior Doctor</option>
<option>Medical Officer</option>
<option>Resident Doctor</option>
<option>Senior Resident</option>
<option>Consultant</option>
<option>Senior Consultant</option>
<option>Specialist</option>
<option>Surgeon</option>
<option>Chief Medical Officer (CMO)</option>
<option>Head of Department (HOD)</option>
</select>
</div>

<div className="col-md-4 mb-3">
<label>Consultation Fee</label>
<input type="number" name="fee" className="form-control" onChange={handleChange}/>
</div>

</div>

</>

)}

{/* OTHERS DETAILS */}

{isOthers && (

<>

<h5 className="mt-4">Professional Details</h5>

<div className="row">

<div className="col-md-4 mb-3">
<label>Select Type</label>
<select name="designation" className="form-control" onChange={handleChange}>
<option value="">Select Type</option>
<option>Senior Nurse</option>
<option>Head Nurse</option>
<option>Nursing Supervisor</option>
<option>Lab Technician</option>
<option>Radiology Technician</option>
<option>Pharmacist</option>
<option>Physiotherapist</option>
<option>Receptionist</option>
<option>Front Office Executive</option>
<option>Hospital Administrator</option>
<option>Billing Executive</option>
<option>HR Exective</option>
<option>IT Support</option>
<option>Ward Assistant</option>
</select>
</div>

</div>

</>

)}

{/* CONTACT */}

<h5 className="mt-4">Contact Details</h5>

<div className="row">

<div className="col-md-4 mb-3">
<label>Mobile</label>
<input type="text" name="mobile" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Whatsapp</label>
<input type="text" name="whatsapp" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Alternate Number</label>
<input type="text" name="altMobile" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Email</label>
<input type="email" name="email" className="form-control" onChange={handleChange}/>
</div>

</div>

{/* ADDRESS */}

<h5 className="mt-4">Address</h5>

<div className="row">

<div className="col-md-4 mb-3">
<label>Street No</label>
<input type="text" name="addressNo" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Street Name</label>
<input type="text" name="street" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Near By</label>
<input type="text" name="nearBy" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>City</label>
<input type="text" name="city" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>District</label>
<input type="text" name="district" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>State</label>
<input type="text" name="state" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Pincode</label>
<input type="text" name="pincode" className="form-control" onChange={handleChange}/>
</div>

<div className="col-md-4 mb-3">
<label>Nationality</label>
<input type="text" name="nationality" className="form-control" onChange={handleChange}/>
</div>

</div>

{/* PHOTO */}

<h5 className="mt-4">Passport & Signature</h5>

<div className="row">

<div className="col-md-4">
<label>Photo</label>
<input type="file" className="form-control" onChange={handlePhoto} ref={photoInputRef}/>

{isImageSrc(photoPreviewSrc) && (
	<>
	<img
		src={photoPreviewSrc}
		alt="Photo preview"
		className="img-thumbnail mt-2 d-block"
		style={{ width: "90px", height: "90px", objectFit: "cover", cursor: "zoom-in" }}
		onClick={() => openImagePreview(photoPreviewSrc, "Photo Preview")}
	/>
	</>
)}
</div>

<div className="col-md-4">
<label>Signature</label>
<input type="file" className="form-control" onChange={handleSign} ref={signInputRef}/>

{isImageSrc(signPreviewSrc) && (
	<>
	<img
		src={signPreviewSrc}
		alt="Signature preview"
		className="img-thumbnail mt-2 d-block"
		style={{ width: "140px", height: "70px", objectFit: "contain", cursor: "zoom-in" }}
		onClick={() => openImagePreview(signPreviewSrc, "Signature Preview")}
	/>
	</>
)}
</div>

</div>

{/* LOGIN */}

<h5 className="mt-4">Login</h5>

<div className="row">

<div className="col-md-4 mb-3">
<label>Username</label>
<input type="text" name="username" className="form-control" onChange={handleChange} value={formData.username} readOnly/>
</div>

<div className="col-md-4 mb-3">
<label>Password</label>
<input type="text" name="password" className="form-control" onChange={handleChange} value={formData.password} readOnly/>
</div>

</div>

<div className="mt-4">

<button className="btn btn-success me-3">
Add
</button>

<button type="button" className="btn btn-secondary" onClick={resetForm}>
Reset
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
				closeImagePreview()
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

)
}

export default AddEmployee