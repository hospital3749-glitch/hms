/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, User, AlertCircle, Stethoscope, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      // Fallback for default admin
      const isDefaultAdmin = trimmedUsername === 'admin' && trimmedPassword === 'admin0123456';
      
      let success = false;
      
      try {
        const q = query(
          collection(db, 'admins'), 
          where('username', '==', trimmedUsername),
          where('password', '==', trimmedPassword)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          success = true;
        }
      } catch (dbErr) {
        console.warn('Database connection failed, checking fallback...', dbErr);
      }

      // Final check: either DB matched or it's the hardcoded default
      if (success || isDefaultAdmin) {
        localStorage.removeItem('mauli_doctor_logged_in');
        localStorage.removeItem('mauli_doctor_id');
        localStorage.setItem('mauli_admin_logged_in', 'true');
        localStorage.setItem('mauli_admin_username', trimmedUsername);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-teal-900/10 p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex bg-teal-600 p-3 rounded-2xl mb-4 shadow-lg shadow-teal-600/20">
              <Heart className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-red-100"
            >
              <AlertCircle size={20} />
              <span className="font-medium text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   placeholder="Enter username"
                   className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                   required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Are you a Doctor?</p>
            <Link 
              to="/doctor/login"
              className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors"
            >
              <Stethoscope size={18} />
              Doctor Portal Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
