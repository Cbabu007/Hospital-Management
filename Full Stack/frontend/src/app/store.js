import { configureStore } from "@reduxjs/toolkit";
import humanResourceReducer from "../redux/humanResourceSlice";
import inpatientBedReducer from "../redux/inpatientBedSlice";

const store = configureStore({
	reducer: {
		humanResource: humanResourceReducer,
		inpatientBed: inpatientBedReducer,
	},
});

export default store;
