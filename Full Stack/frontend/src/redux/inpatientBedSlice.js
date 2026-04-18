import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
	getAvailableRoomNumbers,
} from "../Component/Admin/Inpatient Bed Management/bedStorage";
import { api } from "../services/api";

export const fetchInpatientBookings = createAsyncThunk("inpatientBed/fetchAll", async () => {
	return api.get("/inpatient-beds");
});

export const fetchNextPatientId = createAsyncThunk("inpatientBed/fetchNextPatientId", async () => {
	const result = await api.get("/inpatient-beds/next-patient-id");
	return result.nextPatientId;
});

export const addInpatientBooking = createAsyncThunk("inpatientBed/add", async (payload) => {
	return api.post("/inpatient-beds", payload);
});

export const updateInpatientBooking = createAsyncThunk("inpatientBed/update", async ({ originalPatientId, updatedBooking }) => {
	return api.put(`/inpatient-beds/${encodeURIComponent(originalPatientId)}`, updatedBooking);
});

export const deleteInpatientBooking = createAsyncThunk("inpatientBed/delete", async (patientId) => {
	await api.delete(`/inpatient-beds/${encodeURIComponent(patientId)}`);
	return patientId;
});

const initialState = {
	bookings: [],
	nextPatientId: "PAT100001",
	loading: false,
	error: "",
};

const inpatientBedSlice = createSlice({
	name: "inpatientBed",
	initialState,
	reducers: {
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchInpatientBookings.pending, (state) => {
				state.loading = true;
				state.error = "";
			})
			.addCase(fetchInpatientBookings.fulfilled, (state, action) => {
				state.loading = false;
				state.bookings = action.payload;
			})
			.addCase(fetchInpatientBookings.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to fetch bookings";
			})
			.addCase(fetchNextPatientId.fulfilled, (state, action) => {
				state.nextPatientId = action.payload;
			})
			.addCase(addInpatientBooking.fulfilled, (state, action) => {
				const booking = action.payload;
				const selectedRoomNo = Number.parseInt(String(booking.roomNo), 10);
				const availableRooms = getAvailableRoomNumbers(booking.bedType, state.bookings);

				if (!availableRooms.includes(selectedRoomNo)) {
					return;
				}

				state.bookings.unshift(booking);
			})
			.addCase(updateInpatientBooking.fulfilled, (state, action) => {
				state.bookings = state.bookings.map((item) => {
					return item.patientId === action.payload.patientId ? action.payload : item;
				});
			})
			.addCase(deleteInpatientBooking.fulfilled, (state, action) => {
				state.bookings = state.bookings.filter((item) => item.patientId !== action.payload);
			});
	},
});

export default inpatientBedSlice.reducer;
