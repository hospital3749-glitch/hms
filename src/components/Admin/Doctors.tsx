/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Save, Phone, Clock, Upload, FileText, CheckCircle2, UserX } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Doctor } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contact: '',
    email: '',
    image: '',
    isAvailable: false,
    fee: 100,
    username: '',
    password: ''
  });

  useEffect(() => {
    setDoctors(storage.getDoctors());
  }, []);

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        specialization: doctor.specialization,
        contact: doctor.contact || '',
        email: doctor.email || '',
        image: doctor.image || '',
        isAvailable: doctor.isAvailable,
        fee: doctor.fee || 100,
        username: doctor.username || '',
        password: doctor.password || ''
      });
    } else {
      setEditingDoctor(null);
      setFormData({ 
        name: '', 
        specialization: '', 
        contact: '', 
        email: '', 
        image: '', 
        isAvailable: false, 
        fee: 100,
        username: '',
        password: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedDoctors: Doctor[];
    if (editingDoctor) {
      updatedDoctors = doctors.map(d => d.id === editingDoctor.id ? { ...d, ...formData } : d);
    } else {
      const newDoctor: Doctor = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      };
      updatedDoctors = [...doctors, newDoctor];
    }
    setDoctors(updatedDoctors);
    storage.saveDoctors(updatedDoctors);
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      const updated = doctors.filter(d => d.id !== id);
      setDoctors(updated);
      storage.saveDoctors(updated);
    }
  };

  const toggleAvailability = (id: string) => {
    const updated = doctors.map(d => d.id === id ? { ...d, isAvailable: !d.isAvailable } : d);
    setDoctors(updated);
    storage.saveDoctors(updated);
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

  const filteredDoctors = useMemo(() => {
    const list = doctors.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...list].sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;

      const timeA = a.lastCheckIn && a.lastCheckIn !== '-' ? new Date(a.lastCheckIn).getTime() : 0;
      const timeB = b.lastCheckIn && b.lastCheckIn !== '-' ? new Date(b.lastCheckIn).getTime() : 0;
      
      return timeB - timeA;
    });
  }, [doctors, searchQuery]);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Specialists</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage doctor profiles and availability</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-teal-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
        >
          <Plus size={20} /> Add New Doctor
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 mb-8 max-w-xl">
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> {/* Using clock as search icon fallback if Search not imported */}
          <input 
            type="text" 
            placeholder="Search by name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
            <div className="relative h-64 overflow-hidden bg-gray-50 flex items-center justify-center">
              {doc.image?.startsWith('data:application/pdf') ? (
                <div className="flex flex-col items-center text-teal-600">
                  <FileText size={64} className="mb-2 opacity-20" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Medical Credentials (PDF)</span>
                </div>
              ) : (
                <img 
                  src={doc.image || 'https://images.unsplash.com/photo-1559839734-2b71ef159963'} 
                  alt={doc.name} 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleOpenModal(doc)} className="p-3 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-teal-600 rounded-2xl shadow-lg transition-all">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(doc.id)} className="p-3 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-600 rounded-2xl shadow-lg transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className={`absolute bottom-4 left-4 px-4 py-2 rounded-xl text-xs font-black border backdrop-blur-md flex items-center gap-2 ${
                doc.isAvailable ? 'bg-green-500 text-white border-green-400' : 'bg-red-500 text-white border-red-400'
              }`}>
                {doc.isAvailable ? <CheckCircle2 size={12} /> : <UserX size={12} />}
                {doc.isAvailable ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{doc.name}</h3>
                  <p className="text-teal-600 font-bold text-sm tracking-wide uppercase">{doc.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Consultation</p>
                  <p className="text-xl font-bold text-gray-900">₹{doc.fee}</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between text-[10px] font-black bg-gray-50 p-4 rounded-2xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 uppercase tracking-widest">Logged In</span>
                    <span className="text-gray-900">{formatTime(doc.lastCheckIn)}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-gray-400 uppercase tracking-widest">Logged Out</span>
                    <span className="text-gray-900">{formatTime(doc.lastCheckOut)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium px-4">
                  <Phone size={16} className="text-gray-400" />
                  <span>{doc.contact}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium px-4">
                  <Save size={16} className="text-gray-400" />
                  <span>{doc.email}</span>
                </div>
              </div>

              <button 
                onClick={() => toggleAvailability(doc.id)}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                  doc.isAvailable 
                    ? 'border-red-100 text-red-600 hover:bg-red-50' 
                    : 'border-teal-100 text-teal-600 hover:bg-teal-50'
                }`}
              >
                Mark as {doc.isAvailable ? 'Unavailable' : 'Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{editingDoctor ? 'Edit Specialist' : 'Add New Specialist'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Dr. John Doe"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Specialization</label>
                    <input 
                      required
                      type="text" 
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      placeholder="Ex. Cardiology"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="doctor@medcare.com"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Contact Number</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Consultation Fee (₹)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={formData.fee}
                      onChange={(e) => setFormData({...formData, fee: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end ml-1">
                    <label className="text-sm font-bold text-gray-700">Profile Photo</label>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">URL or Upload (PNG/PDF)</span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative group cursor-pointer h-32 border-2 border-dashed border-gray-100 rounded-2xl hover:border-teal-500 hover:bg-teal-50/10 transition-all flex flex-col items-center justify-center p-4">
                      <input 
                        type="file" 
                        accept="image/png, application/pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      {formData.image.startsWith('data:application/pdf') ? (
                        <div className="text-teal-600 flex flex-col items-center">
                          <FileText size={32} className="mb-2" />
                          <span className="text-xs font-bold">PDF Attached</span>
                        </div>
                      ) : formData.image.startsWith('data:image/') ? (
                        <img src={formData.image} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                      ) : (
                        <div className="text-gray-400 group-hover:text-teal-600 flex flex-col items-center">
                          <Upload size={32} className="mb-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">Select PNG/PDF</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                       <input 
                        type="url" 
                        value={formData.image.startsWith('data:') ? '' : formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        placeholder="...or paste Image URL"
                        className="w-full h-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-gray-400 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 ml-1 italic">* Recommended: 1:1 Aspect Ratio PNG for photos.</p>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                  <input 
                    type="checkbox" 
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    className="w-5 h-5 rounded-md text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-bold text-gray-700">Currently Available for Appointments</label>
                </div>

                <div className="bg-teal-50/50 p-8 rounded-3xl border border-teal-100">
                  <p className="text-sm font-black text-teal-800 uppercase tracking-widest mb-6">Security Credentials</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-teal-700 ml-1 uppercase">Portal Username</label>
                      <input 
                        required
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="Ex. doc_sarah_123"
                        className="w-full px-5 py-4 bg-white border border-teal-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-teal-700 ml-1 uppercase">Portal Password</label>
                      <input 
                        required
                        type="text" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Assign a password"
                        className="w-full px-5 py-4 bg-white border border-teal-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-teal-600 mt-4 italic">* These credentials will be used by the doctor to access their panel</p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-teal-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-teal-600/20"
                >
                  <Save size={20} /> {editingDoctor ? 'Update Doctor Profile' : 'Register New Doctor'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorsManagement;
