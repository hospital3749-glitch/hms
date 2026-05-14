/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Calendar, CreditCard, BarChart3 } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Appointment } from '../../types';

const Revenue = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    monthly: 0
  });

  useEffect(() => {
    const unsubscribe = storage.subscribeAppointments((data) => {
      setAppointments(data);

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const monthStr = now.toISOString().substring(0, 7); // YYYY-MM

      let total = 0;
      let today = 0;
      let monthly = 0;

      data.forEach(app => {
        const fee = app.fee || 0;
        total += fee;
        if (app.date === todayStr) {
          today += fee;
        }
        if (app.date?.startsWith(monthStr)) {
          monthly += fee;
        }
      });

      setStats({ total, today, monthly });
    });
    return () => unsubscribe();
  }, []);

  const cards = [
    { name: 'Total Revenue', value: stats.total, icon: <IndianRupee size={24} />, color: 'bg-teal-600' },
    { name: "Today's Revenue", value: stats.today, icon: <TrendingUp size={24} />, color: 'bg-blue-600' },
    { name: 'Monthly Revenue', value: stats.monthly, icon: <Calendar size={24} />, color: 'bg-indigo-600' },
  ];

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Revenue Analysis</h1>
        <p className="text-gray-500 mt-2 font-medium">Financial overview of hospital services</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className={`${card.color} text-white p-4 rounded-2xl shadow-lg`}>
              {card.icon}
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-1">{card.name}</p>
              <p className="text-3xl font-bold text-gray-900">₹{card.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-teal-600" />
            <h2 className="text-xl font-bold text-gray-900">Revenue Breakdown</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 text-left">
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Patient</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Doctor</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.slice(0, 10).map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{app.patientName}</td>
                  <td className="py-4 px-4 text-gray-600">{app.doctor}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm font-medium">{app.date}</td>
                  <td className="py-4 px-4 font-bold text-teal-600">₹{app.fee || 0}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
