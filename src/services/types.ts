// types/user.ts

/**
 * User role enumeration
 */
export enum UserRole {
	ADMIN = "admin",
	DOCTOR = "doctor",
	NURSE = "nurse",
	STAFF = "staff",
}

/**
 * User interface representing a system user
 */
export interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	isEmailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// types/patient.ts

/**
 * Gender enumeration
 */
export enum Gender {
	MALE = "male",
	FEMALE = "female",
	OTHER = "other",
	PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

/**
 * Blood type enumeration
 */
export enum BloodType {
	A_POSITIVE = "A+",
	A_NEGATIVE = "A-",
	B_POSITIVE = "B+",
	B_NEGATIVE = "B-",
	AB_POSITIVE = "AB+",
	AB_NEGATIVE = "AB-",
	O_POSITIVE = "O+",
	O_NEGATIVE = "O-",
	UNKNOWN = "unknown",
}

/**
 * Contact information interface
 */
export interface ContactInfo {
	phone: string;
	alternatePhone?: string;
	email?: string;
	address: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	emergencyContact?: {
		name: string;
		relationship: string;
		phone: string;
	};
}

/**
 * Insurance information interface
 */
export interface Insurance {
	provider: string;
	policyNumber: string;
	groupNumber?: string;
	expirationDate?: Date;
	primaryInsured?: {
		name: string;
		relationship: string;
		dateOfBirth: Date;
	};
}

/**
 * Medical history item interface
 */
export interface MedicalHistoryItem {
	condition: string;
	diagnosedDate?: Date;
	notes?: string;
}

/**
 * Medication interface
 */
export interface Medication {
	name: string;
	dosage: string;
	frequency: string;
	startDate: Date;
	endDate?: Date;
	prescribedBy?: string;
}

/**
 * Allergy interface
 */
export interface Allergy {
	allergen: string;
	reaction: string;
	severity: "mild" | "moderate" | "severe";
	diagnosed: Date;
}

/**
 * Patient interface representing a patient in the system
 */
export interface Patient {
	id: string;
	medicalRecordNumber: string;
	firstName: string;
	lastName: string;
	dateOfBirth: Date;
	gender: Gender;
	bloodType?: BloodType;

	// Contact and demographic information
	contactInfo: ContactInfo;

	// Insurance information
	insurance?: Insurance;

	// Medical information
	medicalHistory?: Array<MedicalHistoryItem>;
	medications?: Array<Medication>;
	allergies?: Array<Allergy>;

	// System metadata
	createdAt: Date;
	updatedAt: Date;
	assignedDoctor?: string; // Reference to a User id
	notes?: string;
}
