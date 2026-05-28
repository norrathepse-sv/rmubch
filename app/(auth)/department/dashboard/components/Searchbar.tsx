"use client";

import { useRouter } from "next/navigation";
import { CalendarIcon, Search } from "lucide-react"; // ถ้าไม่มีให้ใช้ SVG ปกติแทนได้ครับ

interface SearchBarProps {
  currentStatus: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  searchField?: string;
}

export default function SearchBar({
  currentStatus,
  startDate,
  endDate,
  searchQuery,
  searchField,
}: SearchBarProps) {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const sDate = formData.get("startDate") as string;
    const eDate = formData.get("endDate") as string;

    const params = new URLSearchParams();
    params.set("status", currentStatus);

    // เซ็ตพารามิเตอร์วันที่เข้า URL
    if (sDate) params.set("startDate", sDate);
    if (eDate) params.set("endDate", eDate);

    params.set("page", "1"); // ค้นหาใหม่ให้กลับไปหน้าแรกเสมอ

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
        
        {/* หัวข้อบอกสถานะการค้นหา */}
        <div className="flex items-center gap-2 px-2 text-slate-500 border-r border-slate-100 hidden md:flex mr-2">
          <CalendarIcon className="w-5 h-5" />
          <span className="text-sm font-bold">ช่วงวันที่:</span>
        </div>

        {/* ช่องวันที่เริ่มต้น */}
        <div className="flex flex-col flex-1 w-full gap-1">
          <label className="text-[11px] font-bold text-slate-400 ml-4 uppercase">จากวันที่</label>
          <input
            type="date"
            name="startDate"
            defaultValue={startDate || ""}
            className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>

        {/* ช่องวันที่สิ้นสุด */}
        <div className="flex flex-col flex-1 w-full gap-1">
          <label className="text-[11px] font-bold text-slate-400 ml-4 uppercase">ถึงวันที่</label>
          <input
            type="date"
            name="endDate"
            defaultValue={endDate || ""}
            className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>

        {/* ปุ่มค้นหา */}
        <div className="md:mt-4 w-full md:w-auto pt-1">
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>ค้นหา</span>
          </button>
        </div>

        {/* ปุ่มล้างค่า (ถ้าต้องการ) */}
        { (startDate || endDate) && (
            <div className="md:mt-4 pt-1">
                <button
                    type="button"
                    onClick={() => router.push(`?status=${currentStatus}`)}
                    className="text-xs font-bold text-rose-500 hover:underline px-2"
                >
                    ล้างค่า
                </button>
            </div>
        )}
      </form>
    </div>
  );
}