/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/consistent-type-imports */
// import { Patient } from "../../types/Patient";
//@ts-nocheck

import { Patient } from "../services/types";
import React from "react";

// import { Patient } from "../../types/Patient";

type Props = {
	patient: Patient;
};

const InsuranceInfoCard: React.FC<Props> = ({ patient }) => {
	return (
		<div className="bg-gray-50 p-4 rounded-lg">
			<h4 className="font-semibold text-gray-700 mb-2">Insurance Info</h4>
			<div className="space-y-2 text-sm">
				<p>
					<strong>Provider:</strong> {patient.insuranceProvider}
				</p>
				<p>
					<strong>Number:</strong> {patient.insuranceNumber}
				</p>
				<p>
					<strong>Email Verified:</strong>{" "}
					{patient.isEmailVerified ? "Yes" : "No"}
				</p>
			</div>
		</div>
	);
};

export default InsuranceInfoCard;
