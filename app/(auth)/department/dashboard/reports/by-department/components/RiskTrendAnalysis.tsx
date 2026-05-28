"use client";

import { Activity, TrendingUp, TrendingDown } from "lucide-react";

interface TrendProps {
  currentYearData: number[];
  lastYearData: number[];
  selectedYear: number;
}

export default function RiskTrendAnalysis({
  currentYearData,
  lastYearData,
  selectedYear,
}: TrendProps) {
  const months = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];
  
  const currentTotal = currentYearData.reduce((a, b) => a + b, 0);
  const lastTotal = lastYearData.reduce((a, b) => a + b, 0);
  const diff = currentTotal - lastTotal;
  const isUp = diff > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            แนวโน้มอุบัติการณ์รายเดือน
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            ปีงบประมาณ {selectedYear + 543} เปรียบเทียบกับปี {selectedYear + 542}
          </p>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
          isUp ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isUp ? 'เพิ่มขึ้น' : 'ลดลง'} {Math.abs(diff).toLocaleString()} รายการ
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex items-end justify-between gap-2 h-56 relative border-b border-slate-100 pb-4">
          {months.map((month, idx) => {
            const maxVal = Math.max(...currentYearData, ...lastYearData, 1);
            const currentH = (currentYearData[idx] / maxVal) * 100;
            const lastH = (lastYearData[idx] / maxVal) * 100;

            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2 group h-full">
                <div className="w-full flex items-end justify-center gap-1 h-full relative">
                  {/* ปีก่อน */}
                  <div 
                    title={`ปี ${selectedYear + 542}: ${lastYearData[idx]}`}
                    className="w-2.5 sm:w-3 bg-slate-200 rounded-t-sm transition-all duration-300 group-hover:bg-slate-300" 
                    style={{ height: `${lastH}%` }} 
                  />
                  {/* ปีปัจจุบัน */}
                  <div 
                    title={`ปี ${selectedYear + 543}: ${currentYearData[idx]}`}
                    className="w-2.5 sm:w-3 bg-blue-500 rounded-t-sm shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all duration-300 group-hover:bg-blue-600" 
                    style={{ height: `${currentH}%` }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                  {month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-6 justify-center sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm shadow-sm" />
            <span className="text-xs font-semibold text-slate-600">ปี {selectedYear + 543}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 rounded-sm" />
            <span className="text-xs font-medium text-slate-400">ปี {selectedYear + 542}</span>
          </div>
        </div>
      </div>
    </div>
  );
}