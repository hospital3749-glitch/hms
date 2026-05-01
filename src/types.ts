/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  contact: string;
  email: string;
  image: string;
  isAvailable: boolean;
  fee: number;
  username: string;
  password?: string;
  lastCheckIn?: string;
  lastCheckOut?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  mobileNumber: string;
  email?: string;
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
