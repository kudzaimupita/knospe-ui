/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/consistent-type-imports */
// import { Patient } from "../../types/Patient";
//@ts-nocheck

// import { Patient } from "../../types/Patient";

import { Patient } from "../services/types";
import React from "react";

type Props = {
	patient: Patient;
};

const MedicalInfoCard: React.FC<Props> = ({ patient }) => {
	return (
		<div className="bg-gray-50 p-4 rounded-lg">
			<h4 className="font-semibold text-gray-700 mb-2">Medical Info</h4>
			<div className="space-y-2 text-sm">
				<p>
					<strong>Conditions:</strong> {patient.conditions}
				</p>
				<p>
					<strong>Allergies:</strong> {patient.allergies}
				</p>
				<p>
					<strong>Medications:</strong> {patient.medications}
				</p>
				<p>
					<strong>Last Visit:</strong>{" "}
					{new Date(patient.lastVisit).toLocaleDateString()}
				</p>
			</div>
		</div>
	);
};

export default MedicalInfoCard;
