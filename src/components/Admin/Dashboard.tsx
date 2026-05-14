/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Users, CalendarCheck, Clock, ArrowRight, IndianRupee, Building2, Activity } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    availableWards: 0
  });

  const [todayAppts, setTodayAppts] = useState<any[]>([]);

  useEffect(() => {
    const unsubDoctors = storage.subscribeDoctors((doctors) => {
      const activeCount = doctors.filter(d => d.activeStatus || d.isAvailable).length;
      setStats(prev => ({ 
        ...prev, 
        totalDoctors: doctors.length,
        activeDoctors: activeCount
      }));
    });

    const unsubAppointments = storage.subscribeAppointments((appointments) => {
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointments.filter(app => app.date === today).length;
      const revenue = appointments.reduce((acc, curr) => acc + (curr.fee || 0), 0);
      
      setStats(prev => ({ 
        ...prev, 
        totalAppointments: appointments.length,
        todayAppointments: todayCount,
        totalRevenue: revenue
      }));
      setTodayAppts(appointments.filter(app => app.date === today).slice(0, 5));
    });

    // Wards might remain static or I could make them a collection too
    storage.getWards().then(wards => {
      const avWards = wards.filter(w => w.status === 'Available').length;
      setStats(prev => ({ ...prev, availableWards: avWards }));
    });

    return () => {
      unsubDoctors();
      unsubAppointments();
    };
  }, []);

  const cards = [
    { name: 'Total Doctors', value: stats.totalDoctors, icon: <Users size={24} />, color: 'bg-blue-500', link: '/admin/doctors' },
    { name: 'Active Doctors', value: stats.activeDoctors, icon: <Activity size={24} />, color: 'bg-green-500', link: '/admin/doctors' },
    { name: 'Appointments', value: stats.totalAppointments, icon: <CalendarCheck size={24} />, color: 'bg-teal-500', link: '/admin/appointments' },
    { name: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <IndianRupee size={24} />, color: 'bg-indigo-500', link: '/admin/revenue' },
    { name: 'Available Wards', value: stats.availableWards, icon: <Building2 size={24} />, color: 'bg-purple-500', link: '/admin/wards' },
  ];

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2 font-medium">Welcome back, Admin</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 relative overflow-hidden group">
            <div className={`${card.color} text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-${card.color.split('-')[1]}-500/20`}>
              {card.icon}
            </div>
            <p className="text-gray-400 font-bold tracking-wider uppercase text-[10px] mb-1">{card.name}</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">{card.value}</p>
            
            <Link 
              to={card.link}
              className="flex items-center gap-2 text-xs font-bold text-teal-600 hover:gap-3 transition-all"
            >
              Details <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
          <Link to="/admin/appointments" className="text-teal-600 font-bold text-sm hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left">
                <th className="py-4 px-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Time</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {todayAppts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 font-bold italic">No appointments for today</td>
                </tr>
              ) : (
                todayAppts.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-6 px-8 text-center text-sm font-bold text-teal-600">
                      {app.time}
                    </td>
                    <td className="py-6 px-4">
                      <p className="font-bold text-gray-900 text-sm">{app.patientName}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{app.mobileNumber}</p>
                    </td>
                    <td className="py-6 px-4">
                      <p className="text-sm font-bold text-gray-700">{app.doctor}</p>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                        app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 
                        app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                        'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
