/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Doctor {
  id: string;
  doctorId: string; // Requested field
  name: string; // UI uses this: doctorName
  doctorName: string; // Requested field
  specialization: string;
  contact: string; // UI uses this: phone
  phone: string; // Requested field
  email: string; // Requested field
  image: string;
  isAvailable: boolean; // UI uses this: activeStatus
  activeStatus: boolean; // Requested field
  fee: number;
  username: string;
  password?: string;
  inTime: string; // Requested field
  outTime: string; // Requested field
  lastCheckIn?: string;
  lastCheckOut?: string;
  createdAt: string; // Requested field
}

export interface Appointment {
  id: string;
  patientName: string;
  mobileNumber: string;
  doctor: string;
  doctorId: string; // Linked ID
  department: string;
  date: string;
  time: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  checked: boolean;
  symptoms?: string;
  diagnosis?: string;
  treatmentNotes?: string;
  // Medical Vitals
  weight?: string;
  bloodPressure?: string;
  temperature?: string;
  height?: string;
  fee: number;
  consultationFee?: number;
  extraCharges?: number;
  discount?: number;
  totalAmount?: number;
  paymentStatus?: 'pending' | 'paid';
  createdAt: string;
}

export interface Ward {
  id: string;
  name: string;
  type: string;
  capacity: number;
  occupancy: number;
  status: 'Available' | 'Full';
}

export interface AdminAuth {
  isLoggedIn: boolean;
  user: string | null;
}
