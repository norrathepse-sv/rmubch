// components/ExtraKpiCards.tsx
// ใช้ใน Server Component ได้เลย — ไม่ต้องใส่ "use client"

import { AlertTriangle, Hourglass } from "lucide-react";

interface ExtraKpiCardsProps {
  nearMissCount: number;
  overdueCount: number; // เคสที่ riskstatus ยังไม่ปิด และ daterigter < วันนี้ - 7 วัน
   baseParams: Record<string, string>;

}

export default function ExtraKpiCards({ nearMissCount, overdueCount, baseParams }: ExtraKpiCardsProps) {
  return (
    <>
      {/* Card: Near Miss */}
      <div className="bg-white p-6 rounded-[2rem] border border-amber-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <AlertTriangle size={80} className="text-amber-500" />
        </div>
        <p className="text-amber-600 font-bold text-sm uppercase tracking-wider">Near Miss</p>
        <h2 className="text-5xl font-black text-slate-800 mt-2">{nearMissCount}</h2>
        <p className="text-slate-400 text-xs mt-2 font-medium">เหตุการณ์เฉียด — ยังไม่เกิดอันตราย</p>

        {/* badge เตือนถ้ามีมาก */}
        {nearMissCount > 10 && (
          <span className="absolute bottom-4 right-4 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ควรทบทวน
          </span>
        )}
      </div>

      {/* Card: ค้างนาน > 7 วัน */}
      <div className="bg-white p-6 rounded-[2rem] border border-red-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Hourglass size={80} className="text-red-500" />
        </div>
        <p className="text-red-600 font-bold text-sm uppercase tracking-wider">Overdue &gt; 7 days</p>
        <h2
          className={`text-5xl font-black mt-2 ${
            overdueCount > 0 ? "text-red-600" : "text-slate-800"
          }`}
        >
          {overdueCount}
        </h2>
        <p className="text-slate-400 text-xs mt-2 font-medium">เคสที่เปิดค้างเกิน 7 วัน</p>

        {overdueCount > 0 && (
          <span className="absolute bottom-4 right-4 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            ต้องเร่งดำเนินการ
          </span>
        )}
      </div>
    </>
  );
}
