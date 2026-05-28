"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RotateCcw, FileText, BarChart3, Download, Printer } from 'lucide-react';
import BackButton from '@/app/(auth)/department/dashboard/components/BackButton';

interface Props {
  stats: any[];
  totalIncidents: number;
  incidents: any[];
  departments: string[];
  currentParams: any;
}

export default function AdminRiskReportClient({ stats, totalIncidents, incidents, departments, currentParams }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [filter, setFilter] = useState(currentParams);

const handleSearch = () => {
  const sp = new URLSearchParams();
  if (filter.from) sp.set("from", filter.from);
  if (filter.to) sp.set("to", filter.to);
  if (filter.dept !== "ทั้งหมด") sp.set("dept", filter.dept);
  
  // 🚩 ต้องเพิ่มบรรทัดนี้!
  if (filter.severity && filter.severity !== "ทั้งหมด") {
    sp.set("severity", filter.severity); 
  }
  
  router.push(`?${sp.toString()}`);
};

  const maxCount = stats.length > 0 ? stats[0]._count.riskid : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8 font-inter">
      
      {/* Header & Actions */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Risk Register Report</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">รายงานสรุปข้อมูลอุบัติการณ์และความเสี่ยง</p>
        </div>
        {/* <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm shadow-sm">
            <Download size={18} /> Export Excel
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-sm shadow-xl">
            <Printer size={18} /> พิมพ์รายงาน
          </button>
        </div> */}
        {/* <BackButton/> */}
      </div>

      {/* Filter Bar (Real Logic) */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ตั้งแต่วันที่</label>
            <input 
                type="date" 
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={filter.from}
                onChange={(e) => setFilter({...filter, from: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ถึงวันที่</label>
            <input 
                type="date" 
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={filter.to}
                onChange={(e) => setFilter({...filter, to: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">หน่วยงาน</label>
            <select 
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={filter.dept}
                onChange={(e) => setFilter({...filter, dept: e.target.value})}
            >
              <option>ทั้งหมด</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
         <div className="space-y-1.5">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
    ระดับความรุนแรง
  </label>
  <select 
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
    value={filter.severity} // อย่าลืมเปลี่ยนชื่อ field ใน state filter เป็น severity
    onChange={(e) => setFilter({...filter, severity: e.target.value})}
  >
    <option value="ทั้งหมด">ทั้งหมด</option>
    
    {/* กลุ่มความเสี่ยงทางคลินิก (Clinical Risk) */}
    <optgroup label="Clinical Risk (A-I)">
      <option value="low">ระดับทั่วไป (A - D)</option>
      <option value="high">ระดับรุนแรง (E - I)</option>
    </optgroup>

    {/* กลุ่มความเสี่ยงทั่วไป (General Risk) */}
    <optgroup label="General Risk (1-9)">
      <option value="gen_low">ระดับต่ำ (1 - 2)</option>
      <option value="gen_high">ระดับสูง (3 - 9)</option>
    </optgroup>

    {/* กรณีต้องการเลือกเจาะจง (Optional) */}
    <optgroup label="เจาะจงระดับ">
       {['A','B','C','D','E','F','G','H','I'].map(lv => (
         <option key={lv} value={lv}>ระดับ {lv}</option>
       ))}
    </optgroup>
  </select>
</div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => router.push('?')} className="px-6 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all text-xs flex items-center gap-2">
            <RotateCcw size={14} /> ล้างค่า
          </button>
          <button onClick={handleSearch} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all text-xs flex items-center gap-2 shadow-lg shadow-blue-200">
            <Search size={14} /> ค้นหาข้อมูล
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 print:hidden">
        <button onClick={() => setActiveTab('list')} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
           List Report
        </button>
        <button onClick={() => setActiveTab('stats')} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
           Statistics
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'list' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-[0.2em]">
              <tr>
                <th className="px-6 py-5">วันที่</th>
                <th className="px-6 py-5">หน่วยงาน</th>
                <th className="px-6 py-5">ความเสี่ยง</th>
                <th className="px-6 py-5 text-center">ระดับ</th>
                {/* <th className="px-6 py-5 text-center">สถานะ</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
    {incidents.map((row, idx) => {
  // 1. เตรียมค่าให้สะอาด (ตัดช่องว่าง และทำให้เป็นตัวพิมพ์ใหญ่)
  const firstChar = row.severity?.toString().trim().charAt(0).toUpperCase() || "";
// console.log(`Row ${idx} severity:`, `'${row.severity}'`, "Type:", typeof row.severity);
  // 2. กำหนดเงื่อนไขสี
  const isRed = ['E', 'F', 'G', 'H', 'I', '3', '4', '5', '6', '7', '8', '9'].includes(firstChar);
  const isGreen = ['A', 'B', 'C', 'D', '1', '2'].includes(firstChar);

  // 🚩 ต้องมี return เพื่อส่งค่า JSX ออกไปแสดงผล
  return (
    <tr key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer"
    onClick={() => router.push(`/admin/dashboard/risks/${row.id}`)}>
      <td className="px-6 py-4 font-bold text-slate-500 whitespace-nowrap text-xs">
        {row.incidentDate}
      </td>
      <td className="px-6 py-4 font-black text-slate-800 text-xs">
        {row.department}
      </td>
      <td className="px-6 py-4 text-slate-600 text-xs truncate max-w-xs">
        {row.riskCategory}
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-block px-3 py-1 rounded-lg font-black text-[10px] border transition-colors ${
          isRed 
            ? 'bg-rose-50 text-rose-600 border-rose-100' 
            : isGreen 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-slate-50 text-slate-500 border-slate-100'
        }`}>
          {row.severity}
        </span>
      </td>
      {/* เพิ่มส่วนสถานะเพื่อให้ตารางครบสมบูรณ์ตามหัวข้อ */}
      {/* <td className="px-6 py-4 text-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
          row.status === 'ทบทวนแล้ว' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
        }`}>
          {row.status}
        </span>
      </td> */}
    </tr>
  );
})}
            
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="space-y-8">
             {stats.map((stat: any, idx: number) => (
                <div key={idx} className="group">
                  <div className="flex justify-between mb-3 items-end">
                    <span className="font-black text-slate-700 text-sm uppercase tracking-tight">{stat.depreport}</span>
                    <span className="font-black text-blue-600 text-xl">{stat._count.riskid}</span>
                  </div>
                  <div className="w-full bg-slate-50 h-4 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                      style={{ width: `${(stat._count.riskid / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}