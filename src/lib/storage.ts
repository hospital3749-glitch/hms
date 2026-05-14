/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  serverTimestamp,
  getDoc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, cleanData } from './firebase';
import { Doctor, Appointment, Ward } from '../types';

const DOCTORS_COLLECTION = 'doctors';
const APPOINTMENTS_COLLECTION = 'appointments';
const WARDS_COLLECTION = 'wards';
const PATIENTS_COLLECTION = 'patients';

export const storage = {
  getDoctors: async (): Promise<Doctor[]> => {
    try {
      const q = query(collection(db, DOCTORS_COLLECTION), orderBy('doctorName', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Doctor));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, DOCTORS_COLLECTION);
      return [];
    }
  },

  subscribeDoctors: (callback: (doctors: Doctor[]) => void) => {
    const q = query(collection(db, DOCTORS_COLLECTION), orderBy('doctorName', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const doctors = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Doctor));
      callback(doctors);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, DOCTORS_COLLECTION);
    });
  },

  saveDoctor: async (doctor: Partial<Doctor>) => {
    try {
      const id = doctor.id || doc(collection(db, DOCTORS_COLLECTION)).id;
      const docRef = doc(db, DOCTORS_COLLECTION, id);
      const data = cleanData({
        ...doctor,
        id,
        doctorId: id,
        createdAt: doctor.createdAt || new Date().toISOString(),
      });
      await setDoc(docRef, data, { merge: true });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, DOCTORS_COLLECTION);
    }
  },

  deleteDoctor: async (id: string) => {
    try {
      await deleteDoc(doc(db, DOCTORS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, DOCTORS_COLLECTION);
    }
  },

  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const q = query(collection(db, APPOINTMENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, APPOINTMENTS_COLLECTION);
      return [];
    }
  },

  subscribeAppointments: (callback: (appointments: Appointment[]) => void) => {
    const q = query(collection(db, APPOINTMENTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment));
      callback(appointments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, APPOINTMENTS_COLLECTION);
    });
  },

  addAppointment: async (appointment: any) => {
    try {
      const data = cleanData({
        ...appointment,
        status: 'pending',
        checked: false,
        createdAt: new Date().toISOString(),
      });
      const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), data);
      // Also add to patients collection as requested
      await addDoc(collection(db, PATIENTS_COLLECTION), cleanData({
        patientName: appointment.patientName,
        phone: appointment.mobileNumber,
        appointmentDate: appointment.date,
        doctorAssigned: appointment.doctor,
        docId: appointment.doctorId,
        createdAt: new Date().toISOString(),
      }));
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, APPOINTMENTS_COLLECTION);
    }
  },

  updateAppointmentStatus: async (id: string, status: string, extraData: any = {}) => {
    try {
      await updateDoc(doc(db, APPOINTMENTS_COLLECTION, id), cleanData({ status, ...extraData }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, APPOINTMENTS_COLLECTION);
    }
  },

  deleteAppointment: async (id: string) => {
    try {
      await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, APPOINTMENTS_COLLECTION);
    }
  },

  updateDoctorStatus: async (id: string, isAvailable: boolean) => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      
      const updateData: any = {
        activeStatus: isAvailable,
        isAvailable,
      };

      if (isAvailable) {
        updateData.inTime = timeString;
        updateData.lastLoginDate = now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        updateData.outTime = timeString;
      }

      await updateDoc(doc(db, DOCTORS_COLLECTION, id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, DOCTORS_COLLECTION);
    }
  },

  getWards: async (): Promise<Ward[]> => {
    try {
      const snapshot = await getDocs(collection(db, WARDS_COLLECTION));
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ward));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, WARDS_COLLECTION);
      return [];
    }
  },

  subscribeWards: (callback: (wards: Ward[]) => void) => {
    return onSnapshot(collection(db, WARDS_COLLECTION), (snapshot) => {
      const wards = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ward));
      callback(wards);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, WARDS_COLLECTION);
    });
  },

  saveWard: async (ward: Partial<Ward>) => {
    try {
      const id = ward.id || doc(collection(db, WARDS_COLLECTION)).id;
      const docRef = doc(db, WARDS_COLLECTION, id);
      await setDoc(docRef, cleanData({ ...ward, id }), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, WARDS_COLLECTION);
    }
  },

  deleteWard: async (id: string) => {
    try {
      await deleteDoc(doc(db, WARDS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, WARDS_COLLECTION);
    }
  },

  getPatients: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, PATIENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PATIENTS_COLLECTION);
      return [];
    }
  },

  subscribePatients: (callback: (patients: any[]) => void) => {
    const q = query(collection(db, PATIENTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, PATIENTS_COLLECTION);
    });
  },

  subscribeDoctorAppointments: (doctorId: string, callback: (appointments: Appointment[]) => void) => {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION), 
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, APPOINTMENTS_COLLECTION);
    });
  },

  getDoctor: async (id: string): Promise<Doctor | null> => {
    try {
      const docSnap = await getDoc(doc(db, DOCTORS_COLLECTION, id));
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Doctor;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, DOCTORS_COLLECTION);
      return null;
    }
  },

  initializeAdmin: async () => {
    try {
      const adminRef = doc(db, 'admins', 'default_admin');
      const adminSnap = await getDoc(adminRef);
      
      const defaultData = {
        adminId: 'default_admin',
        username: 'admin',
        password: 'admin0123456',
        role: 'admin',
        updatedAt: new Date().toISOString()
      };

      if (!adminSnap.exists()) {
        await setDoc(adminRef, {
          ...defaultData,
          createdAt: new Date().toISOString()
        });
        console.log('Admin account initialized: admin / admin0123456');
      } else {
        // Ensure default admin always has at least these fields if they are missing
        const existingData = adminSnap.data();
        if (!existingData.username || !existingData.password) {
          await setDoc(adminRef, defaultData, { merge: true });
          console.log('Admin account updated with default credentials');
        }
      }
    } catch (error) {
      console.error('Admin initialization failed:', error);
    }
  }
};
