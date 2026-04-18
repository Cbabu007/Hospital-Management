import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const fetchEmployees = createAsyncThunk("employees/fetchAll", async () => {
	return api.get("/human-resources");
});

export const fetchPublicDoctors = createAsyncThunk("employees/fetchPublicDoctors", async () => {
	return api.get("/human-resources/public-doctors");
});

export const addEmployee = createAsyncThunk("employees/add", async (payload) => {
	// If payload is FormData, use postForm
	if (payload instanceof FormData) {
		return api.postForm("/human-resources", payload);
	}
	return api.post("/human-resources", payload);
});

export const updateEmployee = createAsyncThunk("employees/update", async (payload) => {
	return api.put(`/human-resources/${encodeURIComponent(payload.id)}`, payload);
});

export const deleteEmployee = createAsyncThunk("employees/delete", async (employeeId) => {
	await api.delete(`/human-resources/${encodeURIComponent(employeeId)}`);
	return employeeId;
});

const initialState = {
	employees: [],
	loading: false,
	error: "",
};

const humanResourceSlice = createSlice({
	name: "employees",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEmployees.pending, (state) => {
				state.loading = true;
				state.error = "";
			})
			.addCase(fetchEmployees.fulfilled, (state, action) => {
				state.loading = false;
				state.employees = action.payload;
			})
			.addCase(fetchEmployees.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to fetch employees";
			})
			.addCase(fetchPublicDoctors.pending, (state) => {
				state.loading = true;
				state.error = "";
			})
			.addCase(fetchPublicDoctors.fulfilled, (state, action) => {
				state.loading = false;
				state.employees = action.payload;
			})
			.addCase(fetchPublicDoctors.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to fetch doctors";
			})
			.addCase(addEmployee.fulfilled, (state, action) => {
				state.employees.unshift(action.payload);
			})
			.addCase(updateEmployee.fulfilled, (state, action) => {
				state.employees = state.employees.map((employee) => {
					return employee.id === action.payload.id ? action.payload : employee;
				});
			})
			.addCase(deleteEmployee.fulfilled, (state, action) => {
				state.employees = state.employees.filter((employee) => employee.id !== action.payload);
			});
	},
});

export default humanResourceSlice.reducer;