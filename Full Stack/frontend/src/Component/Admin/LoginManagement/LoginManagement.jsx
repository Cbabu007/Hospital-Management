import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../AdminLayout";
import { api } from "../../../services/api";
import "./LoginManagement.css";

const DEFAULT_COLUMNS = ["name", "mobile", "email", "username", "role"];


const toLabel = (key) => {
	if (!key) {
		return "";
	}

	const value = String(key);
	return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function LoginManagement() {
	const [users, setUsers] = useState([]);
	const [phoneQuery, setPhoneQuery] = useState("");
	const [editingIndex, setEditingIndex] = useState(-1);
	const [editRow, setEditRow] = useState({});

	useEffect(() => {
		const loadUsers = async () => {
			try {
				const result = await api.get("/auth/users");
				setUsers(result);
			} catch {
				setUsers([]);
			}
		};

		loadUsers();
	}, []);

	const columns = useMemo(() => {
		const fromData = new Set(DEFAULT_COLUMNS);
		users.forEach((user) => {
			Object.keys(user || {}).forEach((key) => {
				if (key !== "id") {
					fromData.add(key);
				}
			});
		});

		return Array.from(fromData);
	}, [users]);

	const filteredUsers = useMemo(() => {
		const query = phoneQuery.trim();
		if (!query) {
			return users;
		}

		return users.filter((user) => String(user?.mobile || "").includes(query));
	}, [users, phoneQuery]);

	const beginEdit = (rowIndex) => {
		setEditingIndex(rowIndex);
		setEditRow({ ...users[rowIndex] });
	};

	const cancelEdit = () => {
		setEditingIndex(-1);
		setEditRow({});
	};

	const saveEdit = async () => {
		if (editingIndex < 0) {
			return;
		}

		const selectedUser = users[editingIndex];
		if (!selectedUser?.id) {
			return;
		}

		try {
			const updated = await api.put(`/auth/users/${selectedUser.id}`, editRow);
			const nextUsers = users.map((item, index) => (index === editingIndex ? updated : item));
			setUsers(nextUsers);
			cancelEdit();
		} catch (error) {
			alert(error.message || "Unable to update user");
		}
	};

	const removeUser = async (rowIndex) => {
		if (!window.confirm("Delete this user?")) {
			return;
		}

		const selectedUser = users[rowIndex];
		if (!selectedUser?.id) {
			return;
		}

		try {
			await api.delete(`/auth/users/${selectedUser.id}`);
		} catch (error) {
			alert(error.message || "Unable to delete user");
			return;
		}

		const nextUsers = users.filter((_, index) => index !== rowIndex);
		setUsers(nextUsers);

		if (editingIndex === rowIndex) {
			cancelEdit();
		}
	};

	const updateEditValue = (key, value) => {
		setEditRow((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<AdminLayout>
			<section className="login-mgmt-page">
				<h2 className="login-mgmt-title">Login Management</h2>

				<div className="login-mgmt-toolbar">
					<div className="login-mgmt-search-wrap">
						<label htmlFor="login-mgmt-phone-search">Phone Number Search</label>
						<input
							id="login-mgmt-phone-search"
							type="text"
							value={phoneQuery}
							onChange={(event) => setPhoneQuery(event.target.value)}
							placeholder="Enter phone number"
						/>
					</div>
				</div>

				<div className="login-mgmt-table-wrap">
					<table className="login-mgmt-table">
						<thead>
							<tr>
								{columns.map((column) => (
									<th key={column}>{toLabel(column)}</th>
								))}
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{filteredUsers.length === 0 ? (
								<tr>
									<td colSpan={columns.length + 1} className="login-mgmt-empty">
										No user data found.
									</td>
								</tr>
							) : (
								filteredUsers.map((user) => {
									const originalIndex = users.indexOf(user);
									const isEditing = editingIndex === originalIndex;

									return (
										<tr key={`${user.username || "user"}-${originalIndex}`}>
											{columns.map((column) => (
												<td key={`${column}-${originalIndex}`}>
													{isEditing ? (
														<input
															className="login-mgmt-cell-input"
															value={String(editRow?.[column] ?? "")}
															onChange={(event) => updateEditValue(column, event.target.value)}
														/>
													) : (
														String(user?.[column] ?? "-")
													)}
												</td>
											))}
											<td className="login-mgmt-action-cell">
												{isEditing ? (
													<>
														<button type="button" className="login-mgmt-icon-btn save" onClick={saveEdit} aria-label="Save">
															<i className="fa-solid fa-check" aria-hidden="true" />
														</button>
														<button type="button" className="login-mgmt-icon-btn cancel" onClick={cancelEdit} aria-label="Cancel">
															<i className="fa-solid fa-xmark" aria-hidden="true" />
														</button>
													</>
												) : (
													<>
														<button type="button" className="login-mgmt-icon-btn edit" onClick={() => beginEdit(originalIndex)} aria-label="Edit">
															<i className="fa-solid fa-pen-to-square" aria-hidden="true" />
														</button>
														<button type="button" className="login-mgmt-icon-btn delete" onClick={() => removeUser(originalIndex)} aria-label="Delete">
															<i className="fa-solid fa-trash" aria-hidden="true" />
														</button>
													</>
												)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</section>
		</AdminLayout>
	);
}
