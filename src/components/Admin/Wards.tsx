/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Search, Building2, Users } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Ward } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const WardsManagement = () => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'General',
    capacity: 0,
    occupancy: 0
  });

  useEffect(() => {
    const unsubscribe = storage.subscribeWards((data) => {
      setWards(data);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (ward?: Ward) => {
    if (ward) {
      setEditingWard(ward);
      setFormData({
        name: ward.name,
        type: ward.type,
        capacity: ward.capacity,
        occupancy: ward.occupancy
      });
    } else {
      setEditingWard(null);
      setFormData({ name: '', type: 'General', capacity: 0, occupancy: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const status = formData.occupancy >= formData.capacity ? 'Full' : 'Available';
    
    await storage.saveWard({
      ...formData,
      id: editingWard?.id,
      status
    });
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this ward?')) {
      await storage.deleteWard(id);
    }
  };

  const filteredWards = wards.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         w.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || w.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const wardTypes = ['General', 'ICU', 'Pediatric', 'Emergency', 'Maternity'];

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Wards</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage facility capacity and allocation</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-teal-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
        >
          <Plus size={20} /> Add New Ward
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search wards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-6 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-600 cursor-pointer"
        >
          <option value="All">All Types</option>
          {wardTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWards.map((ward) => (
          <div key={ward.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-teal-50 text-teal-600 p-4 rounded-2xl">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(ward)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(ward.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{ward.name}</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-6">{ward.type}</p>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-500">Occupancy</span>
                  <span className="text-gray-900">{ward.occupancy} / {ward.capacity}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      ward.status === 'Full' ? 'bg-red-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${(ward.occupancy / ward.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold border ${
                ward.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {ward.status === 'Available' ? 'AVAILABLE' : 'FULL'}
              </span>
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
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{editingWard ? 'Edit Ward' : 'Add New Ward'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Ward Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex. Intensive Care Unit B"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Ward Type</label>
                  <select 
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    {wardTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Total Capacity</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Current Occupancy</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      max={formData.capacity}
                      value={formData.occupancy}
                      onChange={(e) => setFormData({...formData, occupancy: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Save size={20} /> {editingWard ? 'Update Ward' : 'Save Ward'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardsManagement;
