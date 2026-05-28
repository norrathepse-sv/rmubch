"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Clock, ChevronLeft, ChevronRight, CheckSquare, 
  CheckCircle2, ListFilter, Search, MessageSquare, Trash2, Filter
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Swal from "sweetalert2";

// Components
import ExportButton from "./ExportButton";
import BackButton from "@/app/(auth)/department/dashboard/components/BackButton";
import { isHighClinicSeverity } from "@/lib/RiskHelper";

// นำเข้า Utility function ที่เราสร้างไว้

export default function RiskListClient({ initialData, exportData, totalCount, currentPage, totalPages, filters }: any) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // สร้าง URL สำหรับเปลี่ยนหน้า
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  // ฟังก์ชันสำหรับจัดการการกรอง (Filter)
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // เมื่อฟิลเตอร์ใหม่ ให้กลับไปหน้า 1 เสมอ
    router.push(`?${params.toString()}`);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === initialData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialData.map((r: any) => r.riskid));
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบข้อมูล?',
      text: `คุณกำลังจะลบรายการ #${id} (ไม่สามารถย้อนกลับได้)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/risks/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          await Swal.fire({ title: 'ลบข้อมูลสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
          router.refresh();
        } else {
          Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
        }
      } catch (error) {
        Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || isSubmitting) return;

    const result = await Swal.fire({
      title: 'ยืนยันการลบข้อมูลแบบกลุ่ม?',
      text: `คุณกำลังจะลบข้อมูลทั้งหมด ${selectedIds.length} รายการ (ไม่สามารถย้อนกลับได้)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/risks/bulk-delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (res.ok) {
          await Swal.fire({ title: 'ลบข้อมูลสำเร็จ!', icon: 'success', timer: 2000, showConfirmButton: false });
          setSelectedIds([]);
          router.refresh();
        } else {
          throw new Error("ไม่สามารถลบข้อมูลได้");
        }
      } catch (error: any) {
        Swal.fire({ title: 'เกิดข้อผิดพลาด', text: error.message, icon: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ดึงค่า filter ปัจจุบันจาก URL
  const currentSeverityFilter = searchParams.get("severity") || "";

  return (
    <div className="space-y-6 font-inter">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ListFilter className="text-blue-600" size={24} />
            รายการอุบัติการณ์ทั้งหมด
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            แสดง {initialData.length} จาก {totalCount} รายการ 
            {selectedIds.length > 0 && (
              <span className="text-blue-600 font-semibold ml-1">
                (เลือกอยู่ {selectedIds.length} รายการ)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              disabled={isSubmitting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-rose-200 hover:bg-rose-600 transition-all disabled:opacity-50"
            >
              <CheckSquare size={18} /> ลบ ({selectedIds.length}) รายการ
            </button>
          )}
          <BackButton />
          <ExportButton data={exportData} filename={`risks_all_filtered`} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-5 w-14 text-center">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={selectedIds.length === initialData.length && initialData.length > 0}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                  />
                </th>
                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ข้อมูลอุบัติการณ์</th>
                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">เส้นทาง (จาก ➔ ถึง)</th>
                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ผู้ประสบปัญหา / รายละเอียด</th>
                
                {/* ---------- จุดที่เพิ่มระบบ Filter ความรุนแรง ---------- */}
                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center relative group">
                  <div className="flex items-center justify-center gap-2">
                    <span>ความรุนแรง</span>
                    <div className="relative inline-block">
                      <select
                        value={currentSeverityFilter}
                        onChange={(e) => handleFilterChange("severity", e.target.value)}
                        className={`appearance-none cursor-pointer pl-2 pr-7 py-1 text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                          currentSeverityFilter !== "" 
                            ? "bg-blue-50 border-blue-200 text-blue-700" 
                            : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <option value="">ทั้งหมด</option>
                        <option value="high">ระดับ E-I (รุนแรง)</option>
                        <option value="low">ระดับ A-D (ทั่วไป)</option>
                      </select>
                      <Filter size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        currentSeverityFilter !== "" ? "text-blue-600" : "text-slate-400"
                      }`} />
                    </div>
                  </div>
                </th>
                {/* -------------------------------------------------------- */}

                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">สถานะ</th>
                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialData.map((risk: any) => {
                const clinicCode = risk.clinicseverity?.charAt(0);
                const isHighClinic = isHighClinicSeverity(clinicCode);

                return (
                  <tr key={risk.riskid} className={`group transition-colors duration-200 ${selectedIds.includes(risk.riskid) ? 'bg-blue-50/60' : 'bg-white hover:bg-slate-50/80'}`}>
                    <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(risk.riskid)}
                        onChange={() => toggleSelect(risk.riskid)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                      />
                    </td>
                    
                    <td className="p-5">
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-slate-800">{risk.daterigter}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">#{risk.riskid}</span>
                          <span className="text-xs font-medium text-slate-500">HN: {risk.riskhn || '-'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {risk.depreport || "-"}
                        </span>
                        <div className="text-slate-300 ml-3 text-[10px]">▼</div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {risk.todep || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="p-5 max-w-[250px]">
                      <p className="text-sm font-bold text-slate-800 truncate mb-1">{risk.riskname || "ไม่ระบุ"}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{risk.riskpresent || "ไม่มีรายละเอียด..."}</p>
                    </td>

                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-[120px]">
                          {risk.risktype || '-'}
                        </span>
                        <div className="flex gap-1.5 mt-1">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border ${isHighClinic ? "bg-red-100 text-red-700 border-red-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
                            {clinicCode || '-'}
                          </span>
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                            {risk.genseverity?.charAt(0) || '-'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-5 text-center">
                      {risk.riskcommenthead ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700  px-3 py-1.5  "><CheckCircle2 size={14} /> ตรวจแล้ว</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700  px-3 py-1.5 "><Clock size={14} /> รอตรวจสอบ</span>
                      )}
                    </td>

                    <td className="p-5">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/dashboard/risks/${risk.riskid}`}>
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Search size={18} /></button>
                        </Link>
                        <Link href={`/admin/dashboard/risks/${risk.riskid}/comment`}>
                          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"><MessageSquare size={18} /></button>
                        </Link>
                        <button onClick={() => handleDelete(risk.riskid)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Section (โค้ดเดิม) */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">หน้า {currentPage} จาก {totalPages}</p>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Link href={createPageUrl(currentPage - 1)} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentPage <= 1 ? 'pointer-events-none text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
              <ChevronLeft size={20} />
            </Link>
            <span className="px-4 text-sm font-bold text-blue-600">{currentPage}</span>
            <Link href={createPageUrl(currentPage + 1)} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentPage >= totalPages ? 'pointer-events-none text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}