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
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contact: '',
    email: '',
    inTime: '09:00',
    outTime: '17:00',
    image: '',
    isAvailable: false,
    activeStatus: false,
    fee: 500,
    username: '',
    password: ''
  });

  useEffect(() => {
    const unsubscribe = storage.subscribeDoctors((data) => {
      setDoctors(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name || doctor.doctorName || '',
        specialization: doctor.specialization,
        contact: doctor.contact || doctor.phone || '',
        email: doctor.email || '',
        inTime: doctor.inTime || '09:00',
        outTime: doctor.outTime || '17:00',
        image: doctor.image || '',
        isAvailable: doctor.activeStatus || doctor.isAvailable || false,
        activeStatus: doctor.activeStatus || doctor.isAvailable || false,
        fee: doctor.fee || 500,
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
        inTime: '09:00',
        outTime: '17:00',
        image: '', 
        isAvailable: true, 
        activeStatus: true,
        fee: 500,
        username: '',
        password: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const doctorData = {
        ...formData,
        username: formData.username.trim(),
        password: formData.password.trim(),
        doctorName: formData.name.trim(),
        phone: formData.contact.trim(),
        activeStatus: formData.isAvailable,
        id: editingDoctor?.id
      };
      await storage.saveDoctor(doctorData);
      setIsModalOpen(false);
      alert(editingDoctor ? 'Doctor updated successfully!' : 'Doctor registered successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check (max 800KB raw before base64 overhead)
    if (file.size > 800 * 1024) {
      if (file.type === 'application/pdf') {
        alert('File size too large. Please select a PDF under 800KB.');
        return;
      }
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;

      if (file.type.startsWith('image/')) {
        // Compress image using Canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Quality 0.7 to ensure it stays well under 1MB even with base64 overhead
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, image: compressed });
        };
        img.src = result;
      } else {
        // For PDFs, we already checked the size
        setFormData({ ...formData, image: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      await storage.deleteDoctor(id);
    }
  };

  const toggleAvailability = async (id: string) => {
    const doc = doctors.find(d => d.id === id);
    if (doc) {
      await storage.updateDoctorStatus(id, !(doc.activeStatus || doc.isAvailable));
    }
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
      (d.name || d.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...list].sort((a, b) => {
      const isAActive = a.activeStatus || a.isAvailable;
      const isBActive = b.activeStatus || b.isAvailable;
      
      if (isAActive && !isBActive) return -1;
      if (!isAActive && isBActive) return 1;

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
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold italic">Loading Database...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold italic">No doctors found</div>
        ) : (
          filteredDoctors.map((doc) => (
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
                    alt={doc.name || doc.doctorName} 
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
                    (doc.activeStatus || doc.isAvailable) ? 'bg-green-500 text-white border-green-400' : 'bg-red-500 text-white border-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      (doc.activeStatus || doc.isAvailable) ? 'bg-white' : 'bg-white'
                    }`}></div>
                    {(doc.activeStatus || doc.isAvailable) ? 'ACTIVE' : 'INACTIVE'}
                  </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{doc.doctorName || doc.name}</h3>
                    <p className="text-teal-600 font-bold text-sm tracking-wide uppercase">{doc.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Fee</p>
                    <p className="text-xl font-bold text-gray-900">₹{doc.fee}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6 flex-1">
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-black bg-teal-50/30 p-4 rounded-2xl border border-teal-50">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 uppercase tracking-widest">Login (IN)</span>
                      <span className="text-teal-700">{doc.inTime || '--:--'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-gray-400 uppercase tracking-widest">Logout (OUT)</span>
                      <span className="text-orange-600">{doc.outTime || '--:--'}</span>
                    </div>
                  </div>
                  
                  {doc.lastLoginDate && (
                    <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Session</span>
                      <span className="text-[10px] font-bold text-gray-600">{doc.lastLoginDate}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 px-4 mt-4">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                      <Phone size={14} className="text-teal-600" />
                      <span>{doc.phone || doc.contact}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                      <FileText size={14} className="text-teal-600" />
                      <span className="truncate">{doc.email}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => toggleAvailability(doc.id)}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                    (doc.activeStatus || doc.isAvailable) 
                      ? 'border-red-100 text-red-600 hover:bg-red-50' 
                      : 'border-teal-100 text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  Mark as {(doc.activeStatus || doc.isAvailable) ? 'Unavailable' : 'Available'}
                </button>
              </div>
            </div>
          ))
        )}
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
                    <label className="text-sm font-bold text-gray-700 ml-1">Contact Number</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      placeholder="+91 90000 00000"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="doctor@maulihospital.com"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">In Time</label>
                    <input 
                      required
                      type="time" 
                      value={formData.inTime}
                      onChange={(e) => setFormData({...formData, inTime: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Out Time</label>
                    <input 
                      required
                      type="time" 
                      value={formData.outTime}
                      onChange={(e) => setFormData({...formData, outTime: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Consultation Fee (₹)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={formData.fee}
                      onChange={(e) => setFormData({...formData, fee: parseInt(e.target.value) || 0})}
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
