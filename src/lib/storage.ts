/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Doctor, Appointment, Ward } from '../types';

const DOCTORS_KEY = 'mauli_doctors';
const APPOINTMENTS_KEY = 'mauli_appointments';
const WARDS_KEY = 'mauli_wards';

const initialDoctors: Doctor[] = [
  { 
    id: '1', 
    name: 'Dr. Sarah Smith', 
    specialization: 'Cardiology', 
    contact: '555-0101', 
    email: 'sarah.smith@maulihospital.com',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ef159963',
    isAvailable: true,
    fee: 150,
    username: 'sarah_doc',
    password: 'password123',
    lastCheckIn: new Date().toLocaleTimeString(),
    lastCheckOut: '-'
  },
  { 
    id: '2', 
    name: 'Dr. James Wilson', 
    specialization: 'Neurology', 
    contact: '555-0102', 
    email: 'james.wilson@maulihospital.com',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
    isAvailable: true,
    fee: 200,
    username: 'james_doc',
    password: 'password123',
    lastCheckIn: new Date().toLocaleTimeString(),
    lastCheckOut: '-'
  },
  { 
    id: '3', 
    name: 'Dr. Emily Chen', 
    specialization: 'Dental', 
    contact: '555-0103', 
    email: 'emily.chen@maulihospital.com',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f',
    isAvailable: false,
    fee: 120,
    username: 'emily_doc',
    password: 'password123',
    lastCheckIn: '-',
    lastCheckOut: new Date().toLocaleTimeString()
  },
];

const initialWards: Ward[] = [
  { id: '1', name: 'General Ward A', type: 'General', capacity: 20, occupancy: 12, status: 'Available' },
  { id: '2', name: 'ICU-1', type: 'ICU', capacity: 5, occupancy: 5, status: 'Full' },
  { id: '3', name: 'Pediatric Ward', type: 'Pediatric', capacity: 15, occupancy: 8, status: 'Available' },
];

export const storage = {
  getDoctors: (): Doctor[] => {
    const data = localStorage.getItem(DOCTORS_KEY);
    if (!data) {
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(initialDoctors));
      return initialDoctors;
    }
    return JSON.parse(data);
  },

  saveDoctors: (doctors: Doctor[]) => {
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
  },

  getWards: (): Ward[] => {
    const data = localStorage.getItem(WARDS_KEY);
    if (!data) {
      localStorage.setItem(WARDS_KEY, JSON.stringify(initialWards));
      return initialWards;
    }
    return JSON.parse(data);
  },

  saveWards: (wards: Ward[]) => {
    localStorage.setItem(WARDS_KEY, JSON.stringify(wards));
  },

  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAppointments: (appointments: Appointment[]) => {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  },

  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'fee' | 'checked' | 'doctorId' | 'treatmentNotes' | 'symptoms' | 'diagnosis' | 'weight' | 'bloodPressure' | 'temperature' | 'height'>) => {
    const appointments = storage.getAppointments();
    const doctors = storage.getDoctors();
    const doctor = doctors.find(d => d.name === appointment.doctor);
    
    const newAppointment: Appointment = {
      ...appointment,
      id: Math.random().toString(36).substr(2, 9),
      doctorId: doctor ? doctor.id : 'unknown',
      status: 'pending',
      checked: false,
      fee: doctor ? doctor.fee : 100,
      createdAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    storage.saveAppointments(appointments);
    return newAppointment;
  },

  updateDoctorStatus: (id: string, isAvailable: boolean) => {
    const doctors = storage.getDoctors();
    const updated = doctors.map(d => 
      d.id === id 
        ? { 
            ...d, 
            isAvailable, 
            lastCheckIn: isAvailable ? new Date().toISOString() : d.lastCheckIn,
            lastCheckOut: !isAvailable ? new Date().toISOString() : d.lastCheckOut 
          } 
        : d
    );
    storage.saveDoctors(updated);
    return updated;
  }
};
