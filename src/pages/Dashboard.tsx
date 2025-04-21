/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
	Bell,
	Calendar,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Filter,
	Menu,
	Search,
	Settings,
	User as UserIcon,
	X,
} from "lucide-react";
import { BloodType, Gender, Patient } from "../services/types";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import React, { useEffect, useState } from "react";

import authService from "../services/apiService";

// Dummy vital signs data for the chart
const generateVitalData = (days = 30) => {
	return Array.from({ length: days }, (_, i) => {
		const date = new Date();
		date.setDate(date.getDate() - (days - i - 1));
		return {
			date: date.toISOString().split("T")[0],
			heartRate: Math.floor(60 + Math.random() * 30),
			bloodPressureSystolic: Math.floor(110 + Math.random() * 30),
			bloodPressureDiastolic: Math.floor(70 + Math.random() * 20),
			temperature: (36.5 + Math.random()).toFixed(1),
		};
	});
};

export const Dashboard = () => {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [patientsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [patientVitalData, setPatientVitalData] = useState<any[]>([]);
	const [navOpen, setNavOpen] = useState(false);
	const [selectedVital, setSelectedVital] = useState("heartRate");
	const [filterOptions, setFilterOptions] = useState({
		gender: "",
		bloodType: "",
		ageRange: "",
	});
	const [showFilters, setShowFilters] = useState(false);

	// Fetch patients
	useEffect(() => {
		const fetchPatients = async () => {
			try {
				setLoading(true);
				const response = await authService.queryPatients(
					{}, // filter
					{ page: currentPage, limit: patientsPerPage } // options
				);
				console.log(response);
				setPatients(response || []);
				// setTotalPages(Math.ceil(response.total / patientsPerPage));
			} catch (error) {
				console.error("Failed to fetch patients:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPatients();
	}, [currentPage, patientsPerPage]);

	// Apply filters and search
	useEffect(() => {
		let results = [...patients];

		// Apply search
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			results = results.filter(
				(patient) =>
					patient.name ||
					patient.lastName.toLowerCase().includes(term) ||
					patient.medicalRecordNumber.toLowerCase().includes(term)
			);
		}

		// Apply filters
		if (filterOptions.gender) {
			results = results.filter(
				(patient) => patient.gender === filterOptions.gender
			);
		}

		if (filterOptions.bloodType) {
			results = results.filter(
				(patient) => patient.bloodType === filterOptions.bloodType
			);
		}

		if (filterOptions.ageRange) {
			const now = new Date();
			switch (filterOptions.ageRange) {
				case "under18":
					results = results.filter((patient) => {
						const age =
							now.getFullYear() - new Date(patient.dateOfBirth).getFullYear();
						return age < 18;
					});
					break;
				case "18to40":
					results = results.filter((patient) => {
						const age =
							now.getFullYear() - new Date(patient.dateOfBirth).getFullYear();
						return age >= 18 && age <= 40;
					});
					break;
				case "41to65":
					results = results.filter((patient) => {
						const age =
							now.getFullYear() - new Date(patient.dateOfBirth).getFullYear();
						return age >= 41 && age <= 65;
					});
					break;
				case "over65":
					results = results.filter((patient) => {
						const age =
							now.getFullYear() - new Date(patient.dateOfBirth).getFullYear();
						return age > 65;
					});
					break;
			}
		}

		setFilteredPatients(results);
	}, [patients, searchTerm, filterOptions]);

	const handlePatientClick = (patient: Patient) => {
		setSelectedPatient(patient);
		setPatientVitalData(generateVitalData());
		setShowModal(true);
	};

	const calculateAge = (dateOfBirth: Date) => {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	const resetFilters = () => {
		setFilterOptions({
			gender: "",
			bloodType: "",
			ageRange: "",
		});
		setSearchTerm("");
	};

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar Navigation */}
			<div
				className={`bg-blue-700 text-white ${navOpen ? "w-64" : "w-16"} transition-all duration-300 flex flex-col`}
			>
				<div className="p-4 flex items-center justify-between">
					{navOpen && <span className="font-bold text-xl">MediTrack</span>}
					<button
						className="p-1 rounded-full hover:bg-blue-800"
						onClick={() => setNavOpen(!navOpen)}
					>
						<Menu size={20} />
					</button>
				</div>

				<nav className="flex-1">
					<ul className="space-y-2 mt-8">
						<li className="px-4 py-2 bg-blue-800 flex items-center space-x-3">
							<Calendar size={20} />
							{navOpen && <span>Dashboard</span>}
						</li>
						<li className="px-4 py-2 hover:bg-blue-600 flex items-center space-x-3">
							<UserIcon size={20} />
							{navOpen && <span>Patients</span>}
						</li>
						<li className="px-4 py-2 hover:bg-blue-600 flex items-center space-x-3">
							<Calendar size={20} />
							{navOpen && <span>Appointments</span>}
						</li>
						<li className="px-4 py-2 hover:bg-blue-600 flex items-center space-x-3">
							<Settings size={20} />
							{navOpen && <span>Settings</span>}
						</li>
					</ul>
				</nav>

				<div className="p-4 mt-auto">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
							<UserIcon size={16} />
						</div>
						{navOpen && (
							<div>
								<p className="text-sm font-semibold">Dr. Smith</p>
								<p className="text-xs opacity-70">View Profile</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Top Header */}
				<header className="bg-white border-b border-gray-200 flex items-center justify-between p-4 shadow-sm">
					<h1 className="text-2xl font-bold text-gray-800">
						Patient Dashboard
					</h1>

					<div className="flex items-center space-x-4">
						<button className="relative p-2 text-gray-500 hover:text-gray-700">
							<Bell size={20} />
							<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
						</button>

						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
								<UserIcon size={16} />
							</div>
							<div className="hidden md:block">
								<p className="text-sm font-medium">Dr. John Smith</p>
								<p className="text-xs text-gray-500">Administrator</p>
							</div>
							<ChevronDown size={16} className="text-gray-500" />
						</div>
					</div>
				</header>

				{/* Content Area */}
				<main className="flex-1 overflow-y-auto p-4">
					<div className="bg-white rounded-lg shadow p-6">
						{/* Search and Filter Controls */}
						<div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
							<div className="flex flex-wrap items-center gap-4">
								<div className="relative">
									<input
										type="text"
										placeholder="Search patients..."
										className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
									<Search
										className="absolute left-3 top-2.5 text-gray-400"
										size={18}
									/>
								</div>

								<button
									className="flex items-center space-x-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
									onClick={() => setShowFilters(!showFilters)}
								>
									<Filter size={16} />
									<span>Filters</span>
								</button>

								{filterOptions.gender ||
								filterOptions.bloodType ||
								filterOptions.ageRange ? (
									<button
										className="flex items-center space-x-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700"
										onClick={resetFilters}
									>
										<X size={16} />
										<span>Clear Filters</span>
									</button>
								) : null}
							</div>

							<div className="text-gray-500 text-sm">
								Showing {filteredPatients.length} of {patients.length} patients
							</div>
						</div>

						{/* Filters Panel */}
						{showFilters && (
							<div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Gender
									</label>
									<select
										className="w-full p-2 border border-gray-300 rounded-md"
										value={filterOptions.gender}
										onChange={(e) =>
											setFilterOptions({
												...filterOptions,
												gender: e.target.value,
											})
										}
									>
										<option value="">Any Gender</option>
										<option value={Gender.MALE}>Male</option>
										<option value={Gender.FEMALE}>Female</option>
										<option value={Gender.OTHER}>Other</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Blood Type
									</label>
									<select
										className="w-full p-2 border border-gray-300 rounded-md"
										value={filterOptions.bloodType}
										onChange={(e) =>
											setFilterOptions({
												...filterOptions,
												bloodType: e.target.value,
											})
										}
									>
										<option value="">Any Type</option>
										<option value={BloodType.A_POSITIVE}>A+</option>
										<option value={BloodType.A_NEGATIVE}>A-</option>
										<option value={BloodType.B_POSITIVE}>B+</option>
										<option value={BloodType.B_NEGATIVE}>B-</option>
										<option value={BloodType.AB_POSITIVE}>AB+</option>
										<option value={BloodType.AB_NEGATIVE}>AB-</option>
										<option value={BloodType.O_POSITIVE}>O+</option>
										<option value={BloodType.O_NEGATIVE}>O-</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Age Range
									</label>
									<select
										className="w-full p-2 border border-gray-300 rounded-md"
										value={filterOptions.ageRange}
										onChange={(e) =>
											setFilterOptions({
												...filterOptions,
												ageRange: e.target.value,
											})
										}
									>
										<option value="">Any Age</option>
										<option value="under18">Under 18</option>
										<option value="18to40">18-40</option>
										<option value="41to65">41-65</option>
										<option value="over65">Over 65</option>
									</select>
								</div>
							</div>
						)}

						{/* Patients Table */}
						<div className="overflow-x-auto">
							{loading ? (
								<div className="text-center py-8">
									<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
									<p className="mt-4 text-gray-600">Loading patients...</p>
								</div>
							) : filteredPatients.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No patients found matching your criteria.
									</p>
								</div>
							) : (
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Patient
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												MRN
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Age
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Gender
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Blood Type
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Contact
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{filteredPatients.map((patient) => (
											<tr
												key={patient.id}
												onClick={() => handlePatientClick(patient)}
												className="hover:bg-blue-50 cursor-pointer transition-colors"
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center">
														<div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
															{patient?.name[0]}
														</div>
														<div className="ml-4">
															<div className="text-sm font-medium text-gray-900">
																{patient.name}
															</div>
															<div className="text-sm text-gray-500">
																DOB:{" "}
																{new Date(
																	patient.dateOfBirth
																).toLocaleDateString()}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{patient.medicalRecordNumber}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{calculateAge(patient.dateOfBirth)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{patient.gender}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
															patient.bloodType?.includes("-")
																? "bg-red-100 text-red-800"
																: "bg-green-100 text-green-800"
														}`}
													>
														{patient.bloodType || "Unknown"}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{patient.contactInfo?.phone}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>

						{/* Pagination */}
						<div className="mt-6 flex items-center justify-between">
							<div className="text-sm text-gray-700">
								Page {currentPage} of {totalPages}
							</div>

							<div className="flex space-x-2">
								<button
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									className={`px-4 py-2 border rounded-md flex items-center ${
										currentPage === 1
											? "bg-gray-100 text-gray-400 cursor-not-allowed"
											: "bg-white text-gray-700 hover:bg-gray-50"
									}`}
								>
									<ChevronLeft size={16} className="mr-1" />
									<span>Previous</span>
								</button>

								<button
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									className={`px-4 py-2 border rounded-md flex items-center ${
										currentPage === totalPages
											? "bg-gray-100 text-gray-400 cursor-not-allowed"
											: "bg-white text-gray-700 hover:bg-gray-50"
									}`}
								>
									<span>Next</span>
									<ChevronRight size={16} className="ml-1" />
								</button>
							</div>
						</div>
					</div>
				</main>
			</div>

			{/* Patient Detail Modal */}
			{showModal && selectedPatient && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 transition-opacity"
							aria-hidden="true"
						>
							<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
						</div>

						<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
							<div className="absolute top-0 right-0 pt-4 pr-4">
								<button
									onClick={() => setShowModal(false)}
									className="text-gray-400 hover:text-gray-600 focus:outline-none"
								>
									<X size={24} />
								</button>
							</div>

							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div>
									<div className="mt-3 sm:mt-0 sm:text-left">
										<div className="flex items-center">
											<div className="mr-4 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
												{selectedPatient.name[0]}
												{/* {selectedPatient.lastName[0]} */}
											</div>
											<div>
												<h3 className="text-2xl leading-6 font-bold text-gray-900">
													{selectedPatient.name}
												</h3>
												<p className="text-sm text-gray-500 mt-1">
													MRN: {selectedPatient.medicalRecordNumber} • DOB:{" "}
													{new Date(
														selectedPatient.dateOfBirth
													).toLocaleDateString()}{" "}
													• {calculateAge(selectedPatient.dateOfBirth)} years
													old
												</p>
											</div>
										</div>

										<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
											<div className="col-span-1 bg-gray-50 p-4 rounded-lg">
												<h4 className="font-semibold text-gray-700 mb-2">
													Patient Information
												</h4>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-gray-500">Gender:</span>
														<span className="font-medium">
															{selectedPatient.gender}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-500">Blood Type:</span>
														<span className="font-medium">
															{selectedPatient?.bloodType || "Unknown"}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-500">Phone:</span>
														<span className="font-medium">
															{selectedPatient?.contactInfo?.phone}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-500">Address:</span>
														<span className="font-medium">
															{selectedPatient.contactInfo?.address.city},{" "}
															{selectedPatient.contactInfo?.address.state}
														</span>
													</div>
												</div>
											</div>

											<div className="col-span-2">
												<h4 className="font-semibold text-gray-700 mb-4">
													Vital Signs History
												</h4>
												<div className="mb-4">
													<select
														className="p-2 border border-gray-300 rounded-md"
														value={selectedVital}
														onChange={(e) => setSelectedVital(e.target.value)}
													>
														<option value="heartRate">Heart Rate (BPM)</option>
														<option value="bloodPressureSystolic">
															Blood Pressure - Systolic
														</option>
														<option value="bloodPressureDiastolic">
															Blood Pressure - Diastolic
														</option>
														<option value="temperature">
															Temperature (°C)
														</option>
													</select>
												</div>
												<div className="h-64">
													<ResponsiveContainer width="100%" height="100%">
														<LineChart
															data={patientVitalData}
															margin={{
																top: 5,
																right: 30,
																left: 20,
																bottom: 5,
															}}
														>
															<CartesianGrid strokeDasharray="3 3" />
															<XAxis
																dataKey="date"
																tickFormatter={(value) => {
																	const date = new Date(value);
																	return `${date.getMonth() + 1}/${date.getDate()}`;
																}}
															/>
															<YAxis />
															<Tooltip />
															<Legend />
															<Line
																type="monotone"
																dataKey={selectedVital}
																stroke="#3B82F6"
																strokeWidth={2}
																dot={{ r: 4 }}
																activeDot={{ r: 6 }}
															/>
														</LineChart>
													</ResponsiveContainer>
												</div>
											</div>
										</div>

										{/* Additional patient information can be added here */}
										<div className="mt-6">
											<div className="border-t border-gray-200 pt-4">
												<h4 className="font-semibold text-gray-700 mb-2">
													Recent Notes
												</h4>
												<p className="text-gray-600">
													{selectedPatient.notes ||
														"No recent notes available for this patient."}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									type="button"
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
									onClick={() => setShowModal(false)}
								>
									Close
								</button>
								<button
									type="button"
									className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
								>
									View Full Record
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
