/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { storage } from '../../lib/storage';

const DoctorLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const doctors = storage.getDoctors();
    const doctor = doctors.find(d => d.username === username && d.password === password);

    if (doctor) {
      storage.updateDoctorStatus(doctor.id, true);
      localStorage.setItem('mauli_doctor_logged_in', 'true');
      localStorage.setItem('mauli_doctor_id', doctor.id);
      navigate('/doctor/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-sky-100">
        <div className="text-center mb-10">
          <div className="bg-teal-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-600/20">
            <Stethoscope size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Portal</h1>
          <p className="text-gray-500 font-medium tracking-wide">Enter your credentials to access your panel</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 animate-shake">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                placeholder="Ex. doc_sarah"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-teal-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-teal-600/20"
          >
            Sign In to Panel
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Hospital Administrator?</p>
          <Link 
            to="/admin/login"
            className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors"
          >
            <ShieldCheck size={18} />
            Admin Portal Login
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-gray-400 font-bold">
          Forgotten credentials? <span className="text-teal-600 cursor-pointer">Contact Administration</span>
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;
