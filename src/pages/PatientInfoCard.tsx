/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/consistent-type-imports */
// import { Patient } from "../../types/Patient";
//@ts-nocheck

import { Patient } from "../services/types";
import React from "react";

type Props = {
	patient: Patient;
};

const PatientInfoCard: React.FC<Props> = ({ patient }) => {
	return (
		<div className="bg-gray-50 p-4 rounded-lg">
			<h4 className="font-semibold text-gray-700 mb-2">Patient Info</h4>
			<div className="space-y-2 text-sm">
				<p>
					<strong>Name:</strong> {patient.name}
				</p>
				<p>
					<strong>Gender:</strong> {patient.gender}
				</p>
				<p>
					<strong>DOB:</strong>{" "}
					{new Date(patient.dateOfBirth).toLocaleDateString()}
				</p>
				<p>
					<strong>Age:</strong>{" "}
					{new Date().getFullYear() -
						new Date(patient.dateOfBirth).getFullYear()}
				</p>
				<p>
					<strong>Blood Type:</strong> {patient.bloodType}
				</p>
				<p>
					<strong>Phone:</strong> {patient.phone}
				</p>
				<p>
					<strong>Email:</strong> {patient.email}
				</p>
				<p>
					<strong>Address:</strong> {patient.address}
				</p>
			</div>
		</div>
	);
};

export default PatientInfoCard;
