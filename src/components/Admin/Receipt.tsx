/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Appointment } from '../../types';
import { Printer, MessageCircle, X, Heart, IndianRupee, Save, Percent, PlusCircle, CreditCard, FileDown, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../../lib/storage';
import { storage as firebaseStorage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptProps {
  appointment: Appointment;
  onClose: () => void;
}

const Receipt = ({ appointment, onClose }: ReceiptProps) => {
  const isAdmin = localStorage.getItem('mauli_admin_logged_in') === 'true';
  const [billing, setBilling] = useState({
    consultationFee: appointment.consultationFee || 500,
    extraCharges: appointment.extraCharges || 0,
    discount: appointment.discount || 0,
    paymentStatus: appointment.paymentStatus || 'pending'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingPDF, setIsSendingPDF] = useState(false);

  const totalAmount = Number(billing.consultationFee) + Number(billing.extraCharges) - Number(billing.discount);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppPDF = async () => {
    setIsSendingPDF(true);
    try {
      const element = document.getElementById('receipt');
      if (!element) return;

      // 1. Generate Canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // 2. Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      const pdfBlob = pdf.output('blob');

      // 3. Upload to Firebase Storage
      const storagePath = `receipts/${appointment.id}_${Date.now()}.pdf`;
      const storageRef = ref(firebaseStorage, storagePath);
      await uploadBytes(storageRef, pdfBlob);
      const publicUrl = await getDownloadURL(storageRef);

      // 4. Send via WhatsApp Business API
      const WHATSAPP_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
      const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

      if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        throw new Error('WhatsApp Business API credentials not configured in environment variables.');
      }

      // Format phone number (remove non-digits, ensure country code)
      let phone = appointment.mobileNumber.replace(/\D/g, '');
      if (phone.length === 10) phone = '91' + phone; // Default to India if 10 digits

      const response = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone,
          type: 'document',
          document: {
            link: publicUrl,
            filename: 'receipt.pdf'
          }
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp document');
      }

      alert('Receipt PDF sent successfully to WhatsApp!');
    } catch (error: any) {
      console.error('WhatsApp PDF error:', error);
      alert(`Error: ${error.message || 'Failed to send PDF'}`);
    } finally {
      setIsSendingPDF(false);
    }
  };

  const handleSaveBilling = async () => {
    setIsSaving(true);
    try {
      await storage.updateAppointmentStatus(appointment.id, appointment.status as any, {
        ...billing,
        totalAmount,
        fee: billing.consultationFee // For backward compatibility
      });
      // Optionally show success or just stay
    } catch (error) {
      console.error('Failed to save billing', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = (method: 'whatsapp') => {
    const message = `Hello ${appointment.patientName}, your medical receipt from Mauli Hospital is ready. \n\nDoctor: ${appointment.doctor}\nStatus: ${appointment.checked ? 'Checked' : 'Pending'}\nTotal Amount: ₹${totalAmount}\nPayment Status: ${billing.paymentStatus.toUpperCase()}`;
    
    if (method === 'whatsapp') {
      window.open(`https://wa.me/${appointment.mobileNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
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
        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl flex flex-col my-auto"
      >
        <div className="p-8 md:p-12 overflow-y-auto" id="receipt">
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
          <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 mb-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${
                billing.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {billing.paymentStatus.toUpperCase()}
              </span>
            </div>

            <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-6 px-2">Billing Breakdown</p>
            
            <div className="space-y-6">
              {/* Consultation Fees */}
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><IndianRupee size={14} className="text-gray-400" /></div>
                  <span className="text-sm font-bold text-gray-500">Consultation Fees</span>
                </div>
                {isAdmin ? (
                  <input 
                    type="number" 
                    value={billing.consultationFee}
                    onChange={(e) => setBilling({...billing, consultationFee: Number(e.target.value)})}
                    className="w-24 text-right px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg font-black text-gray-900"
                  />
                ) : (
                  <span className="text-sm font-black text-gray-900">₹{billing.consultationFee}.00</span>
                )}
              </div>

              {/* Extra Charges */}
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><PlusCircle size={14} className="text-gray-400" /></div>
                  <span className="text-sm font-bold text-gray-500">Extra Charges</span>
                </div>
                {isAdmin ? (
                  <input 
                    type="number" 
                    value={billing.extraCharges}
                    onChange={(e) => setBilling({...billing, extraCharges: Number(e.target.value)})}
                    className="w-24 text-right px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg font-black text-gray-900"
                  />
                ) : (
                  <span className="text-sm font-black text-gray-900">₹{billing.extraCharges}.00</span>
                )}
              </div>

              {/* Discount */}
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><Percent size={14} className="text-gray-400" /></div>
                  <span className="text-sm font-bold text-gray-500">Discount Applied</span>
                </div>
                {isAdmin ? (
                  <input 
                    type="number" 
                    value={billing.discount}
                    onChange={(e) => setBilling({...billing, discount: Number(e.target.value)})}
                    className="w-24 text-right px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg font-black text-red-600"
                  />
                ) : (
                  <span className="text-sm font-black text-red-600">- ₹{billing.discount}.00</span>
                )}
              </div>

              {/* Payment Status Dropdown for Admin */}
              {isAdmin && (
                <div className="flex justify-between items-center px-2 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg"><CreditCard size={14} className="text-gray-400" /></div>
                    <span className="text-sm font-bold text-gray-500">Payment Status</span>
                  </div>
                  <select 
                    value={billing.paymentStatus}
                    onChange={(e) => setBilling({...billing, paymentStatus: e.target.value as any})}
                    className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1 font-black text-[10px] uppercase cursor-pointer outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-8 border-t-2 border-gray-900 px-2 mt-4">
                <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">Total Amount</span>
                <span className="text-3xl font-black text-teal-600">₹{totalAmount}.00</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Thank you for choosing Mauli Hospital</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 flex flex-wrap gap-4 justify-center print:hidden border-t border-gray-100">
          {isAdmin && (
            <button 
              onClick={handleSaveBilling}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl text-xs font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Billing Details'}
            </button>
          )}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-900 hover:bg-gray-100 transition-all shadow-sm"
          >
            <Printer size={16} /> Print Receipt
          </button>
          <button 
            onClick={() => handleShare('whatsapp')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
          >
            <MessageCircle size={16} /> WhatsApp (Text)
          </button>
          <button 
            disabled={isSendingPDF}
            onClick={handleSendWhatsAppPDF}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
          >
            {isSendingPDF ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={16} />}
            {isSendingPDF ? 'Sending PDF...' : 'WhatsApp PDF'}
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
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            visibility: hidden;
          }

          body * {
            visibility: hidden;
          }

          #receipt, #receipt * {
            visibility: visible;
          }

          #receipt {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20mm !important;
            background: white !important;
            visibility: visible !important;
            overflow: visible !important;
            z-index: 9999999 !important;
          }

          /* Remove shadows and rounded corners for a professional print look */
          #receipt {
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .print-hidden, button, .shadow-2xl, .shadow-sm {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}} />
    </div>
  );
};

export default Receipt;
