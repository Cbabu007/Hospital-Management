import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./AdminLayout.css";
import logo from "../../assets/logo.png";

export default function AdminLayout({ children }) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const sidebarRef = useRef(null);
	const menuToggleRef = useRef(null);
	const { logout, user } = useContext(AuthContext);
	const navigate = useNavigate();
	const menuItems = [
		{ path: "/admin/human-resources", label: "Human Resources", permission: "human-resources" },
		{ path: "/admin/login-management", label: "Login Management", permission: "login-management" },
		{ path: "/admin/inpatient-bed-management", label: "Inpatient Bed", subText: "Management", permission: "inpatient-bed-management" },
		{ path: "/admin/patient-feedback", label: "Patient Feedback", permission: "patient-feedback" },
		{ path: "/admin/appointment", label: "Appointment", permission: "appointment" },
	].filter((item) => Array.isArray(user?.permissions) && user.permissions.includes(item.permission));

	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => !prev);
	};

	const handleSignOut = (event) => {
		event.preventDefault();
		logout();
		navigate("/", { replace: true });
	};

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
		const handleDocumentClick = (event) => {
			if (window.innerWidth > 700 || !isSidebarOpen) {
				return;
			}

			const clickedInsideSidebar = sidebarRef.current?.contains(event.target);
			const clickedMenuToggle = menuToggleRef.current?.contains(event.target);

			if (!clickedInsideSidebar && !clickedMenuToggle) {
				setIsSidebarOpen(false);
			}
		};

		document.addEventListener("click", handleDocumentClick);

		return () => {
			document.removeEventListener("click", handleDocumentClick);
		};
	}, [isSidebarOpen]);

	return (
		<div className="admin-frame">
			<button
				ref={menuToggleRef}
				className="menu-toggle"
				id="menuToggle"
				onClick={toggleSidebar}
				type="button"
				aria-label="Toggle menu"
			>
				<span />
				<span />
				<span />
			</button>

			<nav
				ref={sidebarRef}
				className={`sidebar ${isSidebarOpen ? "open" : ""}`}
				id="sidebarNav"
			>
				<div className="sidebar-top-wrap">
					<div className="circle">
						<img
							src={logo}
							alt="Logo"
							className="logo-image"
						/>
					</div>

					<div className="menu">
						{menuItems.map((item) => (
							<a
								key={item.path}
								href={item.path}
								className="menu-link"
								onClick={(event) => {
									event.preventDefault();
									navigate(item.path, { replace: true });
								}}
							>
								{item.label}
								{item.subText ? <span className="menu-sub-text">{item.subText}</span> : null}
							</a>
						))}
					</div>
				</div>

				<div className="sidebar-bottom-wrap">
					<hr className="sidebar-divider" />
					<a
						href="/"
						className="logout"
						onClick={handleSignOut}
					>
						Sign Out
					</a>
				</div>
			</nav>

			<div className="right-panel">
				<div className="main-frame">{children}</div>
			</div>

			<div className="admin-user-tag">{String(user?.name || user?.username || "").trim()}</div>
		</div>
	);
}
