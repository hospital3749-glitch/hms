/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { Appointment } from '../../types';
import { Search, Calendar, User, Clock, CheckCircle2, MessageSquare, X, Send, Phone, Bell, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'checked'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today'>('all');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [consultationFee, setConsultationFee] = useState<string>('500');
  const [vitals, setVitals] = useState({
    weight: '',
    bloodPressure: '',
    temperature: '',
    height: ''
  });

  const doctorId = localStorage.getItem('mauli_doctor_id');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!doctorId) return;
    const unsubscribe = storage.subscribeDoctorAppointments(doctorId, (allAppts) => {
      // Only show approved appointments for this doctor
      const docAppts = allAppts.filter(app => app.status === 'approved');
      setAppointments(docAppts);
    });
    return () => unsubscribe();
  }, [doctorId]);

  const handleOpenCheckup = (app: Appointment) => {
    setSelectedAppt(app);
    setSymptoms(app.symptoms || '');
    setDiagnosis(app.diagnosis || '');
    setTreatmentNotes(app.treatmentNotes || '');
    setConsultationFee(app.consultationFee?.toString() || '500');
    setVitals({
      weight: app.weight || '',
      bloodPressure: app.bloodPressure || '',
      temperature: app.temperature || '',
      height: app.height || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    await storage.updateAppointmentStatus(selectedAppt.id, 'approved', {
      checked: true,
      symptoms,
      diagnosis,
      treatmentNotes,
      consultationFee: Number(consultationFee),
      fee: Number(consultationFee), // For backward compatibility
      ...vitals
    });

    setIsModalOpen(false);
  };

  const filteredAppts = appointments.filter(app => {
    const matchesSearch = app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.date.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && !app.checked) || 
                         (statusFilter === 'checked' && app.checked);
                         
    const matchesDate = dateFilter === 'all' || app.date === today;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkup Queue</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your patients and provide treatment notes</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-10 items-center justify-between bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by patient name or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {[
              { id: 'all', label: 'All History' },
              { id: 'today', label: 'Today Only' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setDateFilter(btn.id as any)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  dateFilter === btn.id 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'pending', label: 'Awaiting' },
              { id: 'checked', label: 'Checked' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id as any)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  statusFilter === btn.id 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAppts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Appointments Found</p>
          </div>
        ) : (
          filteredAppts.map((app) => (
            <div key={app.id} className="group h-full">
              <div className={`h-full bg-white rounded-[2.5rem] border overflow-hidden transition-all shadow-sm flex flex-col ${
              app.checked ? 'border-gray-100 opacity-80' : 'border-teal-100 ring-4 ring-teal-50/50 hover:shadow-xl'
            }`}>
              <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${app.checked ? 'bg-gray-100 text-gray-400' : 'bg-teal-50 text-teal-600'}`}>
                    <User size={24} />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${
                    app.checked ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-teal-50 text-teal-600 border-teal-100'
                  }`}>
                    {app.checked ? 'CHECKED' : 'AWAITING'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{app.patientName}</h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Phone size={12} /> {app.mobileNumber}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Date</p>
                    <p className="text-sm font-bold text-gray-900">{app.date}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Time Slot</p>
                    <p className="text-sm font-bold text-gray-900">{app.time}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Initial Complaint</p>
                  <p className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-2xl leading-relaxed italic border border-gray-50">
                    "{app.description}"
                  </p>
                </div>
              </div>

              <div className="mt-auto p-8 pt-4">
                {app.checked && (
                   <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                      {app.weight && <span className="text-[10px] text-teal-700 font-bold uppercase">Wt: {app.weight}kg</span>}
                      {app.bloodPressure && <span className="text-[10px] text-teal-700 font-bold uppercase tracking-tighter">BP: {app.bloodPressure}</span>}
                    </div>
                    <span className="text-[8px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Recorded</span>
                  </div>
                )}
                <button 
                  onClick={() => handleOpenCheckup(app)}
                  className={`w-full py-5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${
                    app.checked 
                      ? 'bg-gray-100 text-gray-400 cursor-default' 
                      : 'bg-teal-600 text-white shadow-xl shadow-teal-600/20 hover:bg-teal-700'
                  }`}
                >
                  {app.checked ? <CheckCircle2 size={18} /> : <MessageSquare size={18} />}
                  {app.checked ? 'Patient Checked' : 'Start Consultation'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl my-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-50 text-teal-600 p-4 rounded-2xl">
                    <User size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{selectedAppt?.patientName}</h2>
                    <p className="text-teal-600 font-bold text-xs uppercase tracking-widest">Medical Consultation</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="flex items-center gap-4 text-gray-600 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <Phone size={18} className="text-indigo-600" />
                  <span className="text-sm font-bold">{selectedAppt?.mobileNumber}</span>
                </div>
              </div>

              <form onSubmit={handleSaveCheckup} className="space-y-6">
                {/* Vitals Section */}
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4 ml-1">Patient Vitals</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Weight (kg)</label>
                      <input 
                        type="text" 
                        value={vitals.weight}
                        onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                        placeholder="70"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Blood Pressure</label>
                      <input 
                        type="text" 
                        value={vitals.bloodPressure}
                        onChange={(e) => setVitals({...vitals, bloodPressure: e.target.value})}
                        placeholder="120/80"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Temp (°F)</label>
                      <input 
                        type="text" 
                        value={vitals.temperature}
                        onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                        placeholder="98.6"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Height (cm)</label>
                      <input 
                        type="text" 
                        value={vitals.height}
                        onChange={(e) => setVitals({...vitals, height: e.target.value})}
                        placeholder="175"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Symptoms</label>
                    <textarea 
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g. Fever, Cough, Headache..."
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all font-medium text-sm text-gray-700 min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Diagnosis</label>
                    <textarea 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Common Cold, Viral Infection..."
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all font-medium text-sm text-gray-700 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Treatment & Prescription</label>
                    <span className="text-[8px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">Required</span>
                  </div>
                  <textarea 
                    required
                    rows={4}
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    placeholder="Describe findings, prescribed medicine, and advice..."
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all font-medium text-sm text-gray-700 min-h-[150px] shadow-inner"
                  />
                </div>

                <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <IndianRupee size={18} className="text-orange-600" />
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Consultation Fees</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input 
                      required
                      type="number" 
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      placeholder="500"
                      className="w-full pl-10 pr-6 py-4 bg-white border-2 border-orange-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-black text-lg text-gray-900"
                    />
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Bell className="text-orange-500" size={16} />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sending notifications upon save</p>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-teal-600 text-white py-5 rounded-[2rem] font-bold text-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-teal-600/20"
                  >
                    <Send size={20} /> Complete Checkup & Notify Patient
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorAppointments;
