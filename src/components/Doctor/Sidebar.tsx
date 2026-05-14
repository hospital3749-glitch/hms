/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, LogOut, Heart, Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';

const DoctorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const doctorId = localStorage.getItem('mauli_doctor_id');
      if (doctorId) {
        await storage.updateDoctorStatus(doctorId, false);
      }
      localStorage.removeItem('mauli_doctor_logged_in');
      localStorage.removeItem('mauli_doctor_id');
      localStorage.removeItem('mauli_doctor_username');
      navigate('/doctor/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/doctor/dashboard' },
    { name: 'Appointments', icon: <CalendarCheck size={20} />, path: '/doctor/appointments', badge: true },
    { name: 'Patients', icon: <Users size={20} />, path: '/doctor/patients' },
  ];

  return (
    <div className="w-80 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0">
      <div className="p-10 flex items-center gap-3">
        <div className="p-3 bg-teal-600 rounded-2xl shadow-lg shadow-teal-600/20">
          <Heart className="text-white" size={24} />
        </div>
        <span className="text-2xl font-black text-gray-900 tracking-tight">Doctor Panel</span>
      </div>

      <nav className="flex-1 px-6 space-y-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all group ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={isActive ? 'text-white' : 'group-hover:text-teal-600 transition-colors'}>
                  {item.icon}
                </span>
                {item.name}
              </div>
              {item.badge && !isActive && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-gray-50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
