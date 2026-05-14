/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Appointment, Doctor } from '../../types';
import { Calendar, Users, Clock, ArrowRight, UserCheck, Bell, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [stats, setStats] = useState({
    todayAppts: 0,
    totalPatients: 0,
    pendingActions: 0
  });
  const [recentAppts, setRecentAppts] = useState<Appointment[]>([]);

  useEffect(() => {
    const doctorId = localStorage.getItem('mauli_doctor_id');
    if (!doctorId) return;

    const unsubDoc = onSnapshot(doc(db, 'doctors', doctorId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDoctor({ ...data, id: docSnap.id } as Doctor);
      }
    });

    const unsubAppts = storage.subscribeDoctorAppointments(doctorId, (appointments) => {
      const today = new Date().toISOString().split('T')[0];
      const todayDocAppts = appointments.filter(app => app.date === today);
      const uniquePatients = new Set(appointments.map(app => app.patientName)).size;
      const pending = appointments.filter(app => app.status === 'approved' && !app.checked).length;

      setStats({
        todayAppts: todayDocAppts.length,
        totalPatients: uniquePatients,
        pendingActions: pending
      });
      setRecentAppts(todayDocAppts.slice(0, 5));
    });

    return () => {
      unsubDoc();
      unsubAppts();
    };
  }, []);

  const handleCheckAction = async (type: 'in' | 'out') => {
    const doctorId = localStorage.getItem('mauli_doctor_id');
    if (!doctorId) return;
    await storage.updateDoctorStatus(doctorId, type === 'in');
  };

  const formatTime = (isoString?: string) => {
    if (!isoString || isoString === '-') return '-';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const statCards = [
    { name: "Today's Appointments", value: stats.todayAppts, icon: <Clock size={24} />, color: 'bg-blue-600' },
    { name: 'Total Patients Seen', value: stats.totalPatients, icon: <Users size={24} />, color: 'bg-indigo-600' },
    { name: 'Awaiting Checkup', value: stats.pendingActions, icon: <UserCheck size={24} />, color: 'bg-orange-600' },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {doctor?.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${(doctor?.activeStatus || doctor?.isAvailable) ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <p className="text-gray-500 font-medium">Status: {(doctor?.activeStatus || doctor?.isAvailable) ? 'Active / Available' : 'Inactive / Away'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            disabled={doctor?.activeStatus || doctor?.isAvailable}
            onClick={() => handleCheckAction('in')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              (doctor?.activeStatus || doctor?.isAvailable) 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-green-600 hover:bg-green-50 border border-green-100'
            }`}
          >
            <LogIn size={18} /> Check-In
          </button>
          <button 
            disabled={!(doctor?.activeStatus || doctor?.isAvailable)}
            onClick={() => handleCheckAction('out')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              !(doctor?.activeStatus || doctor?.isAvailable) 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-red-600 hover:bg-red-50 border border-red-100'
            }`}
          >
            <LogOut size={18} /> Check-Out
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className={`${card.color} text-white p-4 rounded-2xl shadow-lg`}>
              {card.icon}
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">{card.name}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:cols-span-2 bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="text-teal-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Today's Priority</h2>
            </div>
            <Link to="/doctor/appointments" className="text-teal-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Full Schedule <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="py-4 px-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Time</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient Details</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentAppts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-400 font-bold">No appointments for today</td>
                  </tr>
                ) : (
                  recentAppts.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 px-8 text-center">
                        <span className="inline-block bg-teal-50 text-teal-600 text-xs font-black px-4 py-1.5 rounded-full ring-1 ring-teal-100">
                          {app.time}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <p className="font-bold text-gray-900">{app.patientName}</p>
                        <p className="text-xs text-gray-400 font-medium">{app.description.slice(0, 30)}...</p>
                      </td>
                      <td className="py-6 px-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${
                          app.checked ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {app.checked ? 'CHECKED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <Link to="/doctor/appointments" className="text-teal-600 hover:text-teal-700 font-bold text-sm transition-colors">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <Bell className="text-teal-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900">Recent Updates</h2>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">System Ready</p>
                <p className="text-xs text-gray-400 mt-1 font-medium italic">Your dashboard has been synced with current records.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
