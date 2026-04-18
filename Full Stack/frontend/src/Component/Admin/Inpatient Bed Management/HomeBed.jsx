import React from "react";
import { useSelector } from "react-redux";
import { getAvailability } from "./bedStorage";

export default function HomeBed() {
	const bookings = useSelector((state) => state.inpatientBed.bookings);
	const availability = getAvailability(bookings);

	return (
		<div className="ibm-bed-grid" aria-label="Bed availability overview">
			{availability.map((item) => (
				<div key={item.key} className="ibm-bed-box">
					<h3 className={`ibm-bed-title ${item.color === "green" ? "is-green" : "is-red"}`}>
						{item.label}
					</h3>
					<div className="ibm-bed-count">{item.available}</div>
				</div>
			))}
		</div>
	);
}
