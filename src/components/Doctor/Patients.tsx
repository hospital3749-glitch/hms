/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { Appointment } from '../../types';
import { Users, Search, ChevronRight, MessageCircle, Phone, Calendar } from 'lucide-react';

const DoctorPatients = () => {
  const [patients, setPatients] = useState<{name: string, mobile: string, lastVisit: string, appointmentId: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const doctorId = localStorage.getItem('mauli_doctor_id');

  useEffect(() => {
    if (!doctorId) return;
    const unsubscribe = storage.subscribeDoctorAppointments(doctorId, (docAppts) => {
      const checkedAppts = docAppts.filter(app => app.checked);
      
      // Group by patient name to get unique patient list with their last visit
      const patientMap = new Map();
      checkedAppts.forEach(app => {
        if (!patientMap.has(app.patientName)) {
          patientMap.set(app.patientName, {
            name: app.patientName,
            mobile: app.mobileNumber,
            lastVisit: app.date,
            appointmentId: app.id
          });
        }
      });

      setPatients(Array.from(patientMap.values()));
    });
    return () => unsubscribe();
  }, [doctorId]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mobile.includes(searchQuery)
  );

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Your Patients</h1>
        <p className="text-gray-500 mt-2 font-medium">History of patients you have consulted</p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 mb-10 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 text-left">
              <th className="py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Name</th>
              <th className="py-6 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</th>
              <th className="py-6 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Consultation</th>
              <th className="py-6 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No patients found</p>
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.appointmentId} className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-black text-xs">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Phone size={12} className="text-indigo-600" />
                        {patient.mobile}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                      <Calendar size={14} className="text-teal-600" />
                      {patient.lastVisit}
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex gap-2">
                       <button className="p-3 bg-teal-50 text-teal-600 rounded-2xl hover:bg-teal-600 hover:text-white transition-all shadow-sm">
                        <MessageCircle size={18} />
                      </button>
                      <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorPatients;
