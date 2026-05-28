"use client";

import { ShieldAlert } from "lucide-react";

interface SeverityItem {
  level: string;
  count: number;
  color: string;
}

export default function SeverityCard({ 
  severityStats, 
  totalCount 
}: { 
  severityStats: SeverityItem[]; 
  totalCount: number;
}) {

  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="p-5 border-b bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert size={18} className="text-orange-500" />
          ระดับความรุนแรง (Severity)
        </h3>
      </div>

      <div className="p-6 flex-1">
        <div className="space-y-5">
          {severityStats.length > 0 ? (
           severityStats.map((item) => {
  const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
  
  // ✅ ดึงเฉพาะตัวอักษรตัวแรกออกมา เช่น "E" จาก "E เกิดความคลาดเคลื่อน..."
  const levelChar = item.level.trim().charAt(0).toUpperCase();
  
  // ✅ เช็คเงื่อนไข: ถ้าเป็น E-I ให้เป็นสีแดง (ยกเว้น Z หรือ N/A)
  const isHighRisk = ["E", "F", "G", "H", "I"].includes(levelChar);
  
  // กำหนดสีที่จะแสดงจริง
  const displayColor = isHighRisk ? "#ef4444" : item.color;

  return (
    <div key={item.level} className="group" >
      <div className="flex justify-between items-end mb-2">
        <span className={`text-xs font-black uppercase tracking-tighter truncate max-w-[200px] transition-colors ${
          isHighRisk ? 'text-red-600' : 'text-slate-500'
        }`}>
          {/* ถ้าเป็น E-I จะกลายเป็นตัวหนังสือสีแดง ถ้าไม่ใช่จะเป็นสีเทา Slate ปกติ */}
          Level {item.level}
        </span>
        <span className={`text-xs font-black uppercase tracking-tighter truncate max-w-[200px] transition-colors ${
          isHighRisk ? 'text-red-600' : 'text-slate-500'
        }`}>
          {/* ถ้าเป็น E-I จะกลายเป็นตัวหนังสือสีแดง ถ้าไม่ใช่จะเป็นสีเทา Slate ปกติ */}
           {item.count.toLocaleString()} <span className="text-[10px]  font-normal">รายการ</span>
        </span>
        {/* <span  className="text-sm font-bold text-slate-700">
          {item.count.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">รายการ</span>
        </span> */}
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
          style={{
            width: `${percentage}%`,
            backgroundColor: displayColor // ✅ ใช้สีที่คำนวณใหม่
          }}
        />
      </div>
    </div>
  );
})
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-10">
              <p className="text-sm text-slate-400 italic">ไม่มีข้อมูลความรุนแรงในปีนี้</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50/30 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          วิเคราะห์สัดส่วนความรุนแรงเพื่อวางแผนป้องกันความเสี่ยงซ้ำซ้อน
        </p>
      </div>
    </div>
  );
}