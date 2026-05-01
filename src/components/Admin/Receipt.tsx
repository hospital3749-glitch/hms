/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Appointment } from '../../types';
import { Printer, Download, Share2, Mail, MessageCircle, X, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceiptProps {
  appointment: Appointment;
  onClose: () => void;
}

const Receipt = ({ appointment, onClose }: ReceiptProps) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = (method: 'whatsapp' | 'email') => {
    const message = `Hello ${appointment.patientName}, your medical receipt from Mauli Hospital is ready. \n\nDoctor: ${appointment.doctor}\nStatus: ${appointment.checked ? 'Checked' : 'Pending'}\nFee: ₹${appointment.fee}`;
    
    if (method === 'whatsapp') {
      window.open(`https://wa.me/${appointment.mobileNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.location.href = `mailto:${appointment.email || ''}?subject=Medical Receipt - Mauli Hospital&body=${encodeURIComponent(message)}`;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
      ></motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 md:p-12 overflow-y-auto" id="receipt-content">
          {/* Header */}
          <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-600 rounded-2xl shadow-lg">
                <Heart className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Mauli</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Multi-specialty Hospital</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-gray-900">INV-{appointment.id.toUpperCase()}</p>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase">{new Date(appointment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-4">Patient Information</p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{appointment.patientName}</h2>
              <p className="text-sm text-gray-500 font-medium">{appointment.mobileNumber}</p>
              <p className="text-sm text-gray-400 font-medium mt-1">{appointment.email || 'No email'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-4">Attending Doctor</p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{appointment.doctor}</h2>
              <p className="text-sm text-gray-500 font-medium">{appointment.department}</p>
              <p className="text-xs text-teal-600 font-bold mt-2 bg-teal-50 inline-block px-3 py-1 rounded-full">{appointment.time}</p>
            </div>
          </div>

          {/* Medical Record Section */}
          {appointment.checked && (
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mb-12">
              <div className="grid grid-cols-4 gap-6 mb-8 border-b border-gray-200 pb-8">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Weight</p>
                  <p className="text-sm font-bold text-gray-900">{appointment.weight || '-'} kg</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">BP</p>
                  <p className="text-sm font-bold text-gray-900">{appointment.bloodPressure || '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Temp</p>
                  <p className="text-sm font-bold text-gray-900">{appointment.temperature || '-'} °F</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Height</p>
                  <p className="text-sm font-bold text-gray-900">{appointment.height || '-'} cm</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-2">Diagnosis</p>
                  <p className="text-sm text-gray-900 font-medium leading-relaxed italic">"{appointment.diagnosis || 'General checkup'}"</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-2">Treatment & Advice</p>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">{appointment.treatmentNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Section */}
          <div className="space-y-4 mb-12">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-bold">Consultation Fee</span>
              <span className="text-gray-900 font-black">₹{appointment.fee}.00</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <span className="text-lg font-black text-gray-900 uppercase">Total Amount</span>
              <span className="text-2xl font-black text-teal-600">₹{appointment.fee}.00</span>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Thank you for choosing Mauli Hospital</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 flex flex-wrap gap-4 justify-center print:hidden border-t border-gray-100">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-900 hover:bg-gray-100 transition-all shadow-sm"
          >
            <Printer size={16} /> Print Receipt
          </button>
          <button 
            onClick={() => handleShare('email')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
          >
            <Mail size={16} /> Send Email
          </button>
          <button 
            onClick={() => handleShare('whatsapp')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-green-600 hover:bg-green-50 transition-all shadow-sm"
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-all shadow-lg"
          >
            <X size={16} /> Close
          </button>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </div>
  );
};

export default Receipt;
