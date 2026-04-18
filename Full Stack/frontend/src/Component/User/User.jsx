import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../context/AuthContext";
import { fetchPublicDoctors } from "../../redux/humanResourceSlice";
import { api } from "../../services/api";
import "./User.css";

import logo from "../../assets/logo.png";
import hospital from "../../assets/hospital.png";
import profiledoctor from "../../assets/profiledoctor.png";

function User() {

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { logout } = useContext(AuthContext);
  const employees = useSelector((state) => state.humanResource.employees || []);

	const [selectedDept, setSelectedDept] = useState("");
	const [welcomeName, setWelcomeName] = useState("Guest");
	const [feedbackName, setFeedbackName] = useState("");
	const [feedbackPhone, setFeedbackPhone] = useState("");
	const [feedbackEmail, setFeedbackEmail] = useState("");
	const [feedbackMessage, setFeedbackMessage] = useState("");
	const [feedbackStatus, setFeedbackStatus] = useState("");
	const [appointmentForm, setAppointmentForm] = useState({
		name: "",
		email: "",
		mobile: "",
		date: "",
		message: "",
	});
	const [appointmentStatus, setAppointmentStatus] = useState("");
	const [showAppointmentSection, setShowAppointmentSection] = useState(false);
	const feedbackStatusTimerRef = useRef(null);
	const appointmentStatusTimerRef = useRef(null);
	const appointmentHideTimerRef = useRef(null);

	const doctors = useMemo(() => {
		if (!Array.isArray(employees)) {
			return [];
		}

		return employees
			.filter((employee) => employee?.type === "Doctor")
			.map((employee) => {
				let doctorPhoto = profiledoctor;
				if (employee?.photoData) {
					doctorPhoto = employee.photoData;
				} else if (employee?.photoPath) {
					const fileName = employee.photoPath.split(/[\\/]/).pop();
					doctorPhoto = `http://localhost:5000/uploads/images/${fileName}`;
				}
				return {
					doctorName: String(employee?.name || employee?.username || "Doctor"),
					doctorQualification: String(employee?.qualification || "").trim(),
					doctorDept: String(employee?.department || "General"),
					doctorExp: String(employee?.experience || "0"),
					doctorPhoto,
				};
			});
	}, [employees]);

	useEffect(() => {
		if (!employees.length) {
			dispatch(fetchPublicDoctors());
		}
	}, [dispatch, employees.length]);

	const departments = useMemo(
		() => [...new Set(doctors.map((doc) => doc.doctorDept))],
		[doctors]
	);

	useEffect(() => {
		// Strictly block browser back navigation on protected page.
		const handlePopState = () => {
			window.history.go(1);
		};

		window.history.pushState(null, "", window.location.href);
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	useEffect(() => {
		if (departments.length > 0) {
			setSelectedDept(departments[0]);
		}

		try {
			const signedInUser = JSON.parse(localStorage.getItem("signedInUser") || "null");
			const displayName = String(signedInUser?.name || signedInUser?.username || "").trim();
			if (displayName) {
				setWelcomeName(displayName);
				setFeedbackName(displayName);
				setAppointmentForm((prev) => ({ ...prev, name: displayName }));
			}

			if (signedInUser?.mobile) {
				setFeedbackPhone(String(signedInUser.mobile));
			}

			if (signedInUser?.email) {
				const userEmail = String(signedInUser.email);
				setFeedbackEmail(userEmail);
				setAppointmentForm((prev) => ({ ...prev, email: userEmail }));
			}
		} catch {
			setWelcomeName("Guest");
		}
	}, [departments]);

	useEffect(() => {
		return () => {
			if (feedbackStatusTimerRef.current) {
				clearTimeout(feedbackStatusTimerRef.current);
			}

			if (appointmentStatusTimerRef.current) {
				clearTimeout(appointmentStatusTimerRef.current);
			}

			if (appointmentHideTimerRef.current) {
				clearTimeout(appointmentHideTimerRef.current);
			}
		};
	}, []);

	const filteredDoctors = doctors.filter((doc) => doc.doctorDept === selectedDept);

	const excellenceItems = [
		{ name: "Anethesiology", icon: "fa-solid fa-syringe" },
		{ name: "Dental", icon: "fa-solid fa-tooth" },
		{ name: "Emergency Medicine", icon: "fa-solid fa-truck-medical" },
		{ name: "Ent", icon: "fa-solid fa-ear-listen" },
		{ name: "General Medicine", icon: "fa-solid fa-stethoscope" },
		{ name: "Geriatic", icon: "fa-solid fa-user-nurse" },
		{ name: "Laboratory", icon: "fa-solid fa-flask-vial" },
		{ name: "Nephrology", icon: "fa-solid fa-droplet" },
		{ name: "Neuro Medicine", icon: "fa-solid fa-brain" },
		{ name: "Neuro Surgery", icon: "fa-solid fa-user-doctor" },
		{ name: "Obstetrics and Gynecology", icon: "fa-solid fa-venus" },
		{ name: "Orthopaedics", icon: "fa-solid fa-bone" },
		{ name: "Pediatrics", icon: "fa-solid fa-baby" },
		{ name: "Vascular Surgery", icon: "fa-solid fa-heart-pulse" },
		{ name: "Oncology", icon: "fa-solid fa-ribbon" },
		{ name: "Psychiatry", icon: "fa-solid fa-head-side-virus" },
		{ name: "Pulmonology", icon: "fa-solid fa-lungs" },
		{ name: "Gastroenterology", icon: "fa-solid fa-utensils" },
		{ name: "Plastic Surgery", icon: "fa-solid fa-scissors" },
		{ name: "Pediatric Surgery", icon: "fa-solid fa-child-reaching" },
		{ name: "Urology", icon: "fa-solid fa-water" },
	];

	const excellenceCards = [
		{
			title: "Advanced Surgery",
			description: "State-of-the-art operation theatres and expert surgeons.",
		},
		{
			title: "24/7 Emergency",
			description: "Rapid response emergency care with experienced teams.",
		},
		{
			title: "Patient Care",
			description: "Compassionate nursing and personalised recovery plans.",
		},
	];

	const handleBook = (doc) => {
		if (appointmentHideTimerRef.current) {
			clearTimeout(appointmentHideTimerRef.current);
		}

		sessionStorage.setItem(
			"selectedDoctor",
			JSON.stringify({
				doctorName: doc.doctorName,
				doctorDept: doc.doctorDept,
			})
		);

		setShowAppointmentSection(true);

		// Wait for conditional section render, then scroll to the form.
		window.requestAnimationFrame(() => {
			document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth" });
		});
	};

	const handleFeedbackSubmit = async (event) => {
		event.preventDefault();

		if (!feedbackPhone.trim() || !feedbackEmail.trim()) {
			setFeedbackStatus("Please enter phone number and email.");
			return;
		}

		if (!feedbackMessage.trim()) {
			setFeedbackStatus("Please enter your feedback.");
			return;
		}

		try {
			await api.post("/patient-feedback", {
			name: feedbackName || "Guest",
			phone: feedbackPhone.trim(),
			email: feedbackEmail.trim(),
			feedback: feedbackMessage.trim(),
			date: new Date().toISOString(),
			});
		} catch (error) {
			setFeedbackStatus(error.message || "Unable to submit feedback.");
			return;
		}

		setFeedbackMessage("");
		setFeedbackStatus("Feedback submitted successfully.");

		if (feedbackStatusTimerRef.current) {
			clearTimeout(feedbackStatusTimerRef.current);
		}

		feedbackStatusTimerRef.current = setTimeout(() => {
			setFeedbackStatus("");
		}, 3000);
	};

	const handleAppointmentSubmit = async (event) => {
		event.preventDefault();

		if (!appointmentForm.name.trim() || !appointmentForm.mobile.trim() || !appointmentForm.date) {
			setAppointmentStatus("Please fill all required fields.");
			return;
		}

		let selectedDoctor = null;
		try {
			selectedDoctor = JSON.parse(sessionStorage.getItem("selectedDoctor") || "null");
		} catch {
			selectedDoctor = null;
		}

		try {
			await api.post("/appointments", {
				...appointmentForm,
				email: appointmentForm.email.trim(),
				doctorName: selectedDoctor?.doctorName || "",
				doctorDept: selectedDoctor?.doctorDept || "",
				created: new Date().toISOString(),
			});
		} catch (error) {
			setAppointmentStatus(error.message || "Unable to book appointment.");
			return;
		}

		setAppointmentForm((prev) => ({
			...prev,
			mobile: "",
			date: "",
			message: "",
		}));
		setAppointmentStatus("Appointment booked successfully.");
		sessionStorage.removeItem("selectedDoctor");

		if (appointmentStatusTimerRef.current) {
			clearTimeout(appointmentStatusTimerRef.current);
		}

		appointmentStatusTimerRef.current = setTimeout(() => {
			setAppointmentStatus("");
		}, 3000);

		appointmentHideTimerRef.current = setTimeout(() => {
			setShowAppointmentSection(false);
			setAppointmentStatus("");
		}, 1000);
	};

	const handleLogout = () => {
		logout();
		navigate("/", { replace: true });
	};

	return (
		<div className="user-page">
			<header className="site-header">
				<img src={logo} alt="Logo" className="logo" />
				<span className="welcome-text">Welcome, {welcomeName}</span>

				<a className="call-box" href="tel:+910123456789" aria-label="Call +91 0123456789">
					<i className="fa-solid fa-phone phone-icon" aria-hidden="true"></i>
					<span>0123456789</span>
				</a>

			</header>

			<nav className="side-menu" aria-label="Quick navigation">
				<ul>
					<li><a href="#home"><i className="fa-solid fa-house fa-fw"></i><span className="label">HOME</span></a></li>
					<li><a href="#about"><i className="fa-solid fa-circle-info fa-fw"></i><span className="label">ABOUT</span></a></li>
					<li><a href="#excellences"><i className="fa-solid fa-award fa-fw"></i><span className="label">EXCELLENCE</span></a></li>
					<li><a href="#our-doctors"><i className="fa-solid fa-users fa-fw"></i><span className="label">DOCTORS</span></a></li>
					<li><a href="#feedback"><i className="fa-solid fa-comment-dots fa-fw"></i><span className="label">FEEDBACK</span></a></li>
					<li><a href="#contact"><i className="fa-solid fa-phone fa-fw"></i><span className="label">CONTACT</span></a></li>
					<li>
						<button type="button" className="menu-login" onClick={handleLogout}>
							<i className="fa-solid fa-right-from-bracket fa-fw"></i>
							<span className="label">LOGOUT</span>
						</button>
					</li>
				</ul>
			</nav>

			<main id="home" className="hero">
				<div className="hero-left">
					<h1>Consult Our Trusted Surgeons</h1>
					<p className="subtitle">The best of modern healthcare to ensure you stay healthy, always.</p>
				</div>
				<div className="hero-right">
					<img src={profiledoctor} alt="Doctor" className="doctor" />
				</div>
			</main>

			<section id="about" className="section about">
				<div className="container about-row">
					<div className="about-text">
						<h2>About Us</h2>
						<p>
							Kalaimagal Hospital is a trusted name in healthcare, delivering quality treatment with
							compassionate care for more than 50 years.
						</p>
						<ul className="expert-list">
							<li>Experienced doctors and surgeons</li>
							<li>Advanced surgical care and modern facilities</li>
							<li>Comprehensive diagnosis and treatment</li>
							<li>Patient-centered support and safety</li>
						</ul>
					</div>
					<div className="about-image">
						<img src={hospital} alt="Hospital Building" />
					</div>
				</div>
			</section>

			<section id="excellences" className="section excellences">
				<div className="container">
					<h2>Centres Of Excellence</h2>
					<p className="section-subtitle">
						Combining the best specialists and equipment to provide you nothing short of the
						best in healthcare.
					</p>
					<div className="ex-grid">
						{excellenceItems.map((item) => (
							<div className="ex-box" key={item.name}>
								<span className="ex-icon-wrap">
									<i className={item.icon}></i>
								</span>
								<span>{item.name}</span>
							</div>
						))}
					</div>
					<div className="excellence-cards">
						{excellenceCards.map((card) => (
							<div className="excellence-card" key={card.title}>
								<h3>{card.title}</h3>
								<p>{card.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="our-doctors" className="section team">
				<div className="container">
					<h2 className="section-title">Our Doctors</h2>
					<select
						className="dept-select"
						value={selectedDept}
						onChange={(event) => setSelectedDept(event.target.value)}
						disabled={departments.length === 0}
					>
						{departments.length === 0 ? <option value="">No department found</option> : null}
						{departments.map((dept) => (
							<option key={dept} value={dept}>{dept}</option>
						))}
					</select>

					<div className="doctor-cards-grid">
						{filteredDoctors.map((doc, index) => (
							<div className="doctor-card" key={`${doc.doctorName}-${index}`}>
								<img src={doc.doctorPhoto || profiledoctor} alt={doc.doctorName} />
								<div className="doctor-info">
									<h3>
										{doc.doctorName}
										{doc.doctorQualification ? `, ${doc.doctorQualification}` : ""}
									</h3>
									<p>{doc.doctorExp} years experience</p>
									<button type="button" className="book-btn" onClick={() => handleBook(doc)}>
										Book Appointment
									</button>
								</div>
							</div>
						))}
						{departments.length > 0 && filteredDoctors.length === 0 ? (
							<p>No doctors found for this department.</p>
						) : null}
					</div>
				</div>
			</section>

			<section id="feedback" className="section feedback">
				<div className="container form-container feedback-form">
					<h2>Feedback</h2>
					<form onSubmit={handleFeedbackSubmit}>
						<input
							type="text"
							placeholder="Your Name"
							value={feedbackName}
							onChange={(event) => setFeedbackName(event.target.value)}
						/>
						<input
							type="tel"
							placeholder="Phone Number"
							value={feedbackPhone}
							onChange={(event) => setFeedbackPhone(event.target.value)}
						/>
						<input
							type="email"
							placeholder="Email"
							value={feedbackEmail}
							onChange={(event) => setFeedbackEmail(event.target.value)}
						/>
						<textarea
							rows="4"
							placeholder="Type your feedback"
							value={feedbackMessage}
							onChange={(event) => setFeedbackMessage(event.target.value)}
						/>
						<button type="submit" className="submit-btn">Submit Feedback</button>
					</form>
					{feedbackStatus ? <p className="status-message">{feedbackStatus}</p> : null}
				</div>
			</section>

			{showAppointmentSection ? (
				<section id="appointment" className="section appointment">
					<div className="container form-container appointment-form">
						<h2>Book an Appointment</h2>
						<form onSubmit={handleAppointmentSubmit}>
							<input
								type="text"
								placeholder="Your Name"
								value={appointmentForm.name}
								onChange={(event) =>
									setAppointmentForm((prev) => ({ ...prev, name: event.target.value }))
								}
							/>
							<input
								type="email"
								placeholder="Email"
								value={appointmentForm.email}
								onChange={(event) =>
									setAppointmentForm((prev) => ({ ...prev, email: event.target.value }))
								}
							/>
							<input
								type="tel"
								placeholder="Mobile Number"
								value={appointmentForm.mobile}
								onChange={(event) =>
									setAppointmentForm((prev) => ({ ...prev, mobile: event.target.value }))
								}
							/>
							<input
								type="date"
								value={appointmentForm.date}
								onChange={(event) =>
									setAppointmentForm((prev) => ({ ...prev, date: event.target.value }))
								}
							/>
							<textarea
								rows="3"
								placeholder="Reason for appointment"
								value={appointmentForm.message}
								onChange={(event) =>
									setAppointmentForm((prev) => ({ ...prev, message: event.target.value }))
								}
							/>
							<button type="submit" className="submit-btn">Book Appointment</button>
						</form>
						{appointmentStatus ? <p className="status-message">{appointmentStatus}</p> : null}
					</div>
				</section>
			) : null}

			<footer id="contact" className="site-footer">
				<div className="container footer-grid">
					<div>
						<h4>Contact</h4>
						<p>Phone: +91 0123456789</p>
						<p>Email: info@example.com</p>
						<p>Chennai, Tamil Nadu, India</p>
					</div>
					<div>
						<h4>Quick Links</h4>
						<p><a href="#home">Home</a></p>
						<p><a href="#about">About Us</a></p>
						<p><a href="#our-doctors">Our Doctors</a></p>
					</div>
					<div>
						<h4>Location</h4>
						<iframe
							title="Hospital Location"
							src="https://www.google.com/maps?q=Chennai,India&output=embed"
							loading="lazy"
						></iframe>
					</div>
				</div>
				<div className="footer-bottom">© 2026 Kalaimagal Hospital. All rights reserved.</div>
			</footer>
		</div>
	);
}

export default User;