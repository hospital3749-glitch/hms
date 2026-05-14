/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Users, CalendarCheck, LogOut, Heart, Building2, IndianRupee } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('mauli_admin_logged_in');
    localStorage.removeItem('mauli_admin_username');
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Doctors', icon: <Users size={20} />, path: '/admin/doctors' },
    { name: 'Appointments', icon: <CalendarCheck size={20} />, path: '/admin/appointments' },
    { name: 'Wards', icon: <Building2 size={20} />, path: '/admin/wards' },
    { name: 'Revenue', icon: <IndianRupee size={20} />, path: '/admin/revenue' },
  ];

  return (
    <div className="w-64 h-screen bg-teal-900 text-white fixed left-0 top-0 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-teal-800">
        <div className="bg-white p-2 rounded-lg">
          <Heart className="text-teal-900 w-5 h-5" />
        </div>
        <span className="font-bold text-xl">Admin Panel</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-teal-600 text-white shadow-lg' 
                : 'text-teal-100/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-teal-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
