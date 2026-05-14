/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Check, X, Trash2, Calendar, Clock, User, Phone, FileText, Search, Filter, UserRound } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Appointment, Doctor } from '../../types';
import Receipt from './Receipt';
import { motion, AnimatePresence } from 'motion/react';

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [dateTypeFilter, setDateTypeFilter] = useState<'all' | 'today' | 'tomorrow' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Get current date strings for filtering
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  useEffect(() => {
    const unsubAppts = storage.subscribeAppointments((data) => setAppointments(data));
    const unsubDocs = storage.subscribeDoctors((data) => setDoctors(data));
    return () => {
      unsubAppts();
      unsubDocs();
    };
  }, []);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    await storage.updateAppointmentStatus(id, status);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      await storage.deleteAppointment(id);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-600 border-green-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const matchesSearch = 
        app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesDoctor = doctorFilter === 'all' || app.doctorId === doctorFilter;
      
      let matchesDate = true;
      if (dateTypeFilter === 'today') {
        matchesDate = app.date === today;
      } else if (dateTypeFilter === 'tomorrow') {
        matchesDate = app.date === tomorrow;
      } else if (dateTypeFilter === 'custom' && customDate) {
        matchesDate = app.date === customDate;
      }
      
      return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, doctorFilter, dateTypeFilter, customDate, today, tomorrow]);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Requests</h1>
          <p className="text-gray-500 mt-2 font-medium">Review and manage patient bookings</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 mb-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by patient, doctor, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
            />
          </div>
          
          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {(['all', 'today', 'tomorrow', 'custom'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setDateTypeFilter(type)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  dateTypeFilter === type 
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-50 min-w-[200px]">
            <Filter size={18} className="text-teal-600" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none font-bold text-gray-600 cursor-pointer flex-1 text-sm"
            >
              <option value="all">Any Status</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-50 min-w-[200px]">
            <UserRound size={18} className="text-teal-600" />
            <select 
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="bg-transparent outline-none font-bold text-gray-600 cursor-pointer flex-1 text-sm"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>

          {dateTypeFilter === 'custom' && (
            <div className="flex items-center gap-3 bg-teal-50 px-5 py-3 rounded-2xl border border-teal-100 animate-in fade-in slide-in-from-top-2">
              <Calendar size={18} className="text-teal-600" />
              <input 
                type="date" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="bg-transparent outline-none font-bold text-teal-900 text-sm"
              />
            </div>
          )}

          <div className="ml-auto">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Found {filteredAppointments.length} Results
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {filteredAppointments.length === 0 ? (
            <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-gray-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-400">No appointments found</h3>
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                  <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Patient Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold">
                          {app.patientName[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{app.patientName}</h4>
                          <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">{app.department}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone size={14} className="text-gray-400" />
                          <span>{app.mobileNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appt Detail */}
                    <div className="space-y-4 border-l border-gray-50 pl-6">
                      <div className="flex items-center gap-3">
                        <User size={18} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Assigned Doctor</p>
                          <p className="font-bold text-gray-800">{app.doctor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <Calendar size={14} className="text-teal-600" />
                          <span>{app.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <Clock size={14} className="text-teal-600" />
                          <span>{app.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-1 border-l border-gray-50 pl-6">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-2">Problem Description</p>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed italic mb-4">
                        "{app.description || 'No description provided.'}"
                      </p>
                      
                      {app.checked && app.treatmentNotes && (
                        <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 mt-4">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] text-teal-700 font-black uppercase">Medical Record</p>
                            <div className="flex gap-4">
                              {app.weight && <span className="text-[9px] text-teal-600 font-bold">Wt: {app.weight}kg</span>}
                              {app.bloodPressure && <span className="text-[9px] text-teal-600 font-bold">BP: {app.bloodPressure}</span>}
                              {app.temperature && <span className="text-[9px] text-teal-600 font-bold">Temp: {app.temperature}F</span>}
                            </div>
                          </div>
                          <div className="space-y-2">
                             {app.diagnosis && (
                              <p className="text-[10px] text-gray-900 font-bold">
                                Diagnosis: <span className="font-medium text-gray-600">{app.diagnosis}</span>
                              </p>
                            )}
                            <p className="text-[10px] text-gray-900 font-bold">
                              Treatment: <span className="font-medium text-gray-600 line-clamp-2">{app.treatmentNotes}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col justify-center items-start lg:items-center border-l border-gray-50 pl-6 gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>

                      {app.checked && (
                        <div className="flex flex-col gap-2 w-full">
                          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black border flex items-center justify-between gap-4 ${
                            app.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            <span>{app.paymentStatus?.toUpperCase() || 'PENDING'}</span>
                            <span>₹{app.totalAmount || app.fee}</span>
                          </div>
                          
                          <button 
                            onClick={() => { setSelectedAppt(app); setShowReceipt(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
                          >
                            <FileText size={14} /> Receipt / Billing
                          </button>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-gray-400 font-medium">Booked: {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-3 pt-6 lg:pt-0 lg:pl-8 border-t lg:border-t-0 lg:border-l border-gray-50">
                    <button 
                      onClick={() => handleStatusChange(app.id, 'approved')}
                      disabled={app.status === 'approved'}
                      className={`p-3 rounded-2xl transition-all ${
                        app.status === 'approved' 
                          ? 'bg-gray-100 text-gray-300' 
                          : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white shadow-sm'
                      }`}
                      title="Approve Appointment"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(app.id, 'rejected')}
                      disabled={app.status === 'rejected'}
                      className={`p-3 rounded-2xl transition-all ${
                        app.status === 'rejected' 
                          ? 'bg-gray-100 text-gray-300' 
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white shadow-sm'
                      }`}
                      title="Reject Appointment"
                    >
                      <X size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"
                      title="Delete Entry"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showReceipt && selectedAppt && (
          <Receipt appointment={selectedAppt} onClose={() => setShowReceipt(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentsManagement;
