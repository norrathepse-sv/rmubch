"use client"; // 👈 ต้องมีบรรทัดนี้ที่บนสุด

import { useRouter } from "next/navigation";

interface FiscalYearSelectProps {
  existingFiscalYears: number[];
  selectedFiscalYear: number;
}

export default function FiscalYearSelect({ 
  existingFiscalYears, 
  selectedFiscalYear 
}: FiscalYearSelectProps) {
  const router = useRouter();

  return (
    <div className="relative inline-block text-left">
      {/* <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">
        Select Fiscal Year
      </label> */}
      <select
        value={selectedFiscalYear}
        onChange={(e) => {
          // ใช้ router.push เพื่อเปลี่ยน URL โดยไม่รีโหลดหน้าเว็บทั้งหมด
          router.push(`?fiscalYear=${e.target.value}`);
        }}
        className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer hover:border-blue-300 transition-all"
      >
        {existingFiscalYears.map((year) => (
          <option key={year} value={year}>
            ปีงบประมาณ {year + 543}
          </option>
        ))}
      </select>
      
      {/* Arrow Icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 pt-5 text-slate-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.707 6.586 4.293 8l5 5z" />
        </svg>
      </div>
    </div>
  );
}