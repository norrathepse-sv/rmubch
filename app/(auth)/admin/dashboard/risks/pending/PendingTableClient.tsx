"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Clock, ArrowLeft, ChevronLeft, ChevronRight, CheckSquare, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PendingTableClient({ initialData, totalCount, currentPage, totalPages }: any) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // จัดการการเลือก Checkbox
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

  // ฟังก์ชันอนุมัติหลายรายการ (Bulk Approve)
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0 || isSubmitting) return;
    
    if (!confirm(`ยืนยันการอนุมัติทั้ง ${selectedIds.length} รายการ?`)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/risks/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        alert("อนุมัติรายการสำเร็จ");
        setSelectedIds([]);
        router.refresh(); // รีเฟรชข้อมูลหน้าเว็บ
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Clock className="text-orange-500" size={28} />
              รายการรอลงนามตรวจสอบ
            </h1>
            <p className="text-slate-500 font-medium font-inter">ทั้งหมด {totalCount} รายการ (เลือกอยู่ {selectedIds.length} รายการ)</p>
          </div>
          
          <div className="flex gap-3">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkApprove}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                <CheckSquare size={16} /> อนุมัติ {selectedIds.length} รายการ
              </button>
            )}
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-all px-4 py-2">
              <ArrowLeft size={16} /> กลับหน้าหลัก
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 w-12">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={selectedIds.length === initialData.length && initialData.length > 0}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่/เวลา </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">HN</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">จากหน่วยงาน</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ถึงหน่วยงาน</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ผู้ประสบปัญหา</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
  เหตุการณ์ / ความรุนแรง
</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                {/* <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">จัดการ</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {initialData.map((risk: any) => (
                <tr 
                 key={risk.riskid}
                 className={`
        cursor-pointer transition-all duration-200
        hover:bg-blue-50/50 hover:shadow-[inset_4px_0_0_0_#3b82f6]
        ${selectedIds.includes(risk.riskid) ? 'bg-blue-50/40' : 'bg-white'}
      `}
                 onClick={() => router.push(`/admin/dashboard/risks/${risk.riskid}`)}
                 >

                  <td className="p-6">
  <input 
    type="checkbox" 
    checked={selectedIds.includes(risk.riskid)}
    onChange={() => toggleSelect(risk.riskid)}
    onClick={(e) => e.stopPropagation()} // ✅ เพิ่มบรรทัดนี้
    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
  />
</td>
                  <td className="p-6 space-y-1">
                    <p className="text-sm font-bold text-slate-600">{new Date(risk.daterigter).toLocaleDateString('th-TH')}</p>
                    <p className="text-xs font-black text-slate-400">{risk.timepicker instanceof Date ? risk.timepicker.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : String(risk.timepicker ?? "-")}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-black text-slate-400">#{risk.riskhn}</p>
                    {/* <p className="text-sm font-bold text-slate-600">{risk.riskhn}</p> */}
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{risk.depreport}</span>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{risk.todep}</span>
                  </td>
                <td className="p-6">
  <p className="text-sm font-semibold text-slate-700 max-w-[150px] truncate cursor-help hover:text-blue-600 transition-colors" title={risk.riskname}>
    {risk.riskname}
  </p>
  
  {risk.risktypedt && (
    <div 
      className="max-w-[150px] group relative cursor-help outline-none" 
      tabIndex={0} // ทำให้ Tablet แตะเพื่อ Focus ได้
    >
      <div 
        className="text-[10px] text-slate-400 font-medium truncate leading-relaxed group-focus:text-blue-600 transition-colors"
        dangerouslySetInnerHTML={{ 
          __html: risk.risktypedt.replace(/<p>/g, '').replace(/<\/p>/g, ' ') 
        }} 
      />

      {/* Tooltip: แสดงทั้งตอน Hover (Desktop) และ Focus/Active (Tablet) */}
      <div className="absolute bottom-full left-0 mb-3 hidden group-hover:block group-focus:block group-active:block bg-slate-900 text-white text-[10px] p-4 rounded-2xl shadow-2xl w-72 z-50 pointer-events-none border border-slate-700 ring-1 ring-white/10">
        <div className="font-black mb-1 text-blue-400 uppercase tracking-tighter">รายละเอียดฉบับเต็ม:</div>
        <div className="leading-relaxed opacity-90" dangerouslySetInnerHTML={{ __html: risk.risktypedt || "-" }} />
        {/* ลูกศรชี้ลง */}
        <div className="absolute top-full left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900"></div>
      </div>
    </div>
  )}
</td>
               <td className="p-4 px-6">
  <div className="flex flex-col items-center gap-2">
    {/* ส่วนบน: ประเภทเหตุการณ์ */}
    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-600 border border-orange-200 whitespace-nowrap">
      {risk.risktype || '-'}
    </span>

    {/* ส่วนล่าง: ระดับความรุนแรง */}
    <div className="flex items-center justify-center gap-1.5">
      {risk.clinicseverity ? (
        <div className="group relative outline-none" tabIndex={0}>
          <span className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full border shadow-sm ${
              ['G','H','I'].includes(risk.clinicseverity.charAt(0)) 
                ? 'bg-rose-100 text-rose-600 border-rose-200' 
                : 'bg-blue-100 text-blue-600 border-blue-200'
            }`}>
            {risk.clinicseverity.charAt(0)}
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus:block bg-slate-800 text-white text-[9px] px-2 py-1 rounded-lg whitespace-nowrap z-50">
            คลินิก: {risk.clinicseverity}
          </div>
        </div>
      ) : <span className="text-slate-300 text-[10px]">-</span>}

      <div className="w-[1px] h-3 bg-slate-200" />

      {risk.genseverity ? (
        <div className="group relative outline-none" tabIndex={0}>
          <span className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full border shadow-sm ${
              ['4','5'].includes(risk.genseverity.charAt(0)) 
                ? 'bg-rose-100 text-rose-600 border-rose-200' 
                : 'bg-emerald-100 text-emerald-600 border-emerald-200'
            }`}>
            {risk.genseverity.charAt(0)}
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus:block bg-slate-800 text-white text-[9px] px-2 py-1 rounded-lg whitespace-nowrap z-50">
            ทั่วไป: {risk.genseverity}
          </div>
        </div>
      ) : <span className="text-slate-300 text-[10px]">-</span>}
    </div>
  </div>
</td>

                 <td className="p-6 text-center">
  {risk.riskstatus && (risk.riskstatus === "2" ? (
    <div className="group relative inline-block outline-none" tabIndex={0}>
      <span 
        className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg uppercase border border-emerald-100 cursor-help transition-all hover:bg-emerald-100 group-focus:ring-2 group-focus:ring-emerald-500 group-focus:ring-offset-1"
      >
        <CheckCircle2 size={14} className="text-emerald-500" />
        
      </span>

      {/* Tooltip สำหรับ Tablet & Desktop */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus:block bg-slate-800 text-white text-[10px] px-3 py-2 rounded-xl whitespace-nowrap z-50 shadow-xl border border-slate-700">
        <p className="font-bold">ผู้รับผิดชอบตรวจสอบเรียบร้อยแล้ว</p>
        {/* ลูกศรชี้ลง */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div>
      </div>
    </div>
  ) : (
    <span className="inline-flex items-center text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-2 rounded-lg uppercase border border-rose-100">
      รอการตรวจสอบ
    </span>
  ))}
</td>
                  {/* <td className="p-6 text-center">
                    <Link href={`/admin/risks/${risk.riskid}`}>
                      <button className="text-slate-400 hover:text-blue-600 transition-colors"><Eye size={20} /></button>
                    </Link>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Component */}
          <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">หน้า {currentPage} จาก {totalPages}</p>
            <div className="flex gap-2">
              <Link href={`?page=${currentPage - 1}`} className={`p-2 rounded-xl border ${currentPage <= 1 ? 'pointer-events-none opacity-20' : 'hover:bg-slate-50'}`}><ChevronLeft size={18}/></Link>
              <div className="flex items-center px-4 text-sm font-black text-slate-700">{currentPage}</div>
              <Link href={`?page=${currentPage + 1}`} className={`p-2 rounded-xl border ${currentPage >= totalPages ? 'pointer-events-none opacity-20' : 'hover:bg-slate-50'}`}><ChevronRight size={18}/></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}