"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { AlertTriangle, ListFilter, TrendingUp } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function SummaryClient({ severityData, categoryData }: any) {
  
  // เตรียมข้อมูลสำหรับ Pie Chart (ความรุนแรง)
 const pieData = {
  labels: severityData.map((d: any) => `ระดับ ${d.clinicseverity || 'N/A'}`),
  datasets: [{
    data: severityData.map((d: any) => d._count.riskid),
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'],
      borderWidth: 0,
    }],
  };

  // เตรียมข้อมูลสำหรับ Bar Chart (ประเภทความเสี่ยง)
 const barData = {
  labels: categoryData.map((d: any) => d.risktype || 'ทั่วไป'),
  datasets: [{
    label: 'จำนวนครั้ง',
    data: categoryData.map((d: any) => d._count.riskid),
      backgroundColor: '#6366f1',
      borderRadius: 8,
    }],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* ส่วนที่ 1: สัดส่วนความรุนแรง */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold">
          <AlertTriangle className="text-amber-500" size={20} />
          <h3>สัดส่วนระดับความรุนแรง</h3>
        </div>
        <div className="aspect-square max-h-[300px] mx-auto">
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* ส่วนที่ 2: ประเภทอุบัติการณ์ที่พบบ่อย */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold">
          <ListFilter className="text-blue-500" size={20} />
          <h3>5 อันดับประเภทความเสี่ยงที่พบมากที่สุด</h3>
        </div>
        <div className="h-[300px]">
          <Bar data={barData} options={{ 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }} />
        </div>
      </div>

      {/* ส่วนที่ 3: แผงสรุปตัวเลข (Quick Stats) */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-rose-100 text-sm font-bold uppercase tracking-wider">High Risk (Level 4-5)</p>
          <h4 className="text-3xl font-black mt-1">
            {severityData.filter((d: any) => parseInt(d.risk_level) >= 4).reduce((a: any, b: any) => a + b._count.riskid, 0)}
          </h4>
          <p className="text-[10px] mt-2 opacity-80 italic text-rose-100">*ต้องรีบทบทวนแผนป้องกัน</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-sm font-bold">ประเภทที่พบบ่อยที่สุด</p>
          <h4 className="text-xl font-bold text-slate-700 mt-1 truncate">
            {categoryData[0]?.risk_type || 'ไม่มีข้อมูล'}
          </h4>
          <TrendingUp className="text-emerald-500 mt-2" size={20} />
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
           <div>
              <p className="text-slate-400 text-sm font-bold">Total Record</p>
              <h4 className="text-3xl font-black">{severityData.reduce((a: any, b: any) => a + b._count.riskid, 0)}</h4>
           </div>
           <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
              <BarChart3 className="text-blue-400" />
           </div>
        </div>
      </div>
    </div>
  );
}

// เพิ่ม Icon ที่ขาดไปใน import
import { BarChart3 } from "lucide-react";