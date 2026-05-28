import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText, Search, Filter, ArrowLeft } from "lucide-react";
import ExportButton from "./components/ExportButton";
import BackButton from "@/app/(auth)/department/dashboard/components/BackButton";
import dayjs from "dayjs"

// --- Helper: เดียวกับ Dashboard เพื่อให้เงื่อนไข Severity ตรงกัน ---
function severityWhere(severity?: string) {
  if (!severity || severity === "ทั้งหมด") return {};
  
  const map: Record<string, object> = {
    // คลินิก A-D
    low: { clinicseverity: { in: ['A', 'B', 'C', 'D'] } },
    // คลินิก E-I
    high: { clinicseverity: { in: ['E', 'F', 'G', 'H', 'I'] } },
    // ทั่วไป 1-2
    gen_low: { genseverity: { in: ['1', '2'] } },
    // ทั่วไป 3-9
    gen_high: { genseverity: { in: ['3', '4', '5', '6', '7', '8', '9'] } },
  };

  // ถ้าเลือกแบบเจาะจงตัวอักษรเดียว (เช่น 'A', 'E')
  if (severity.length === 1) {
    return {
      OR: [
        { clinicseverity: { startsWith: severity } },
        { genseverity: { startsWith: severity } }
      ]
    };
  }

  return map[severity] ?? {};
}

export default async function AdminRiskList({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    status?: string; 
    page?: string; 
    from?: string; 
    to?: string; 
    dept?: string; 
    severity?: string; 
  }> 
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any).deplevel !== "9") redirect("/");

  const sParams = await searchParams;
  const currentPage = Number(sParams.page) || 1;
  const currentStatus = sParams.status || "";
  const from = sParams.from || "";
  const to = sParams.to || "";
  const dept = sParams.dept || "";
  const severity = sParams.severity || "";
  
  const rowsPerPage = 10;
  const skip = (currentPage - 1) * rowsPerPage;

  // --- Build Where Clause ---
  const where: any = { };
  if (currentStatus === "4") {
    where.riskstatus = { in: ["3", "4"] };
  } else if (currentStatus) {
    where.riskstatus = currentStatus;
  }
  if (dept) where.depreport = dept;
  
  if (from || to) {
    where.daterigter = {};
    if (from) where.daterigter.gte = new Date(from);
    if (to)   where.daterigter.lte = new Date(to + "T23:59:59");
  }

  const sevWhere = severityWhere(severity);
  Object.assign(where, sevWhere);

  // --- Data Fetching ---
const [totalCount, risks, allRisksForExport] = await Promise.all([
    prisma.riskmain.count({ where }),
    prisma.riskmain.findMany({
      where,
      orderBy: { riskid: 'desc' },
      skip: skip,
      take: rowsPerPage,
    }),
    prisma.riskmain.findMany({
      where,
      orderBy: { riskid: 'desc' }
    })
  ]);


  


const exportData = allRisksForExport.map(r => {
    // ฟังก์ชันช่วยดึงเวลาแบบ Local (ป้องกันเวลาเพี้ยน 7 ชม.)
    const getLocalTime = (date: Date | null) => {
        if (!date) return "-";
        return date.toLocaleTimeString('th-TH', { hour12: false });
    };

    // ฟังก์ชันคลีน HTML Tags, CSS และ &nbsp;
    const cleanText = (text: string | null) => {
        if (!text) return "";
        return text
            .replace(/<[^>]*>/g, '')      // ลบ HTML Tags
            .replace(/&nbsp;/g, ' ')      // เปลี่ยน &nbsp; เป็นช่องว่าง
            .replace(/\s+/g, ' ')         // ยุบช่องว่างที่ซ้ำซ้อน
            .trim();
    };

    return {
        ...r,
        riskid: Number(r.riskid),
        // แก้ไขวันที่ให้เป็นรูปแบบอ่านง่าย (ไทย)
        daterigter: r.daterigter ? dayjs(r.daterigter).format("DD/MM/YYYY") : null,
        // แก้ไขเวลาให้ตรงกับใน DB (Local Time)
        timepicker: r.timepicker 
        ? (typeof r.timepicker === 'string' ? r.timepicker : dayjs(r.timepicker).format("HH:mm"))
        : "-",
        // คลีนเนื้อหาที่เป็น HTML ออกให้หมด
        riskpresent: cleanText(r.riskpresent),
        riskfirstedit: cleanText(r.riskfirstedit),
        riskresultedit: cleanText(r.riskresultedit),
        risknote: cleanText(r.risknote),
        // แปลง Status ให้ตรงกับ Dashboard
        status_text: (r.riskstatus === "3" || r.riskstatus === "4") ? "ตรวจสอบแล้ว" : 
                     r.riskstatus === "2" ? "รอตรวจสอบ" : r.riskstatus
    };
});


  const totalPages = Math.ceil(totalCount / rowsPerPage);



  // --- Helper สร้าง URL สำหรับ Pagination/Filter ---
  const createQueryString = (overrides: Record<string, string | number | null>) => {
    const params = new URLSearchParams({
      status: currentStatus,
      from,
      to,
      dept,
      severity,
      page: currentPage.toString(),
    });
    
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value.toString());
    });
    
    return params.toString();
  };

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              {/* ส่ง params กลับไปหน้า Dashboard เพื่อให้ Filter ยังอยู่ครบ */}
              <BackButton />
              
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              จัดการรายการ<span className="text-blue-600">อุบัติการณ์</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {severity && <span className="mr-2 text-rose-500 font-bold">ระดับ: {severity.toUpperCase()}</span>}
              พบ {totalCount} รายการ 
            </p>
          </div>

          {/* --- Status Filter Buttons --- */}
          <div className="flex flex-wrap items-center gap-3">
            {/* --- เพิ่มปุ่ม Export ตรงนี้ --- */}
            <ExportButton
              data={exportData} 
              filename={`risk-report-${new Date().toISOString().split('T')[0]}`} 
            />

            {/* --- Status Filter Buttons --- */}
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
              <Link 
                href={`/admin/dashboard/risks?${createQueryString({ status: "", page: 1 })}`}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!currentStatus ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                ทั้งหมด
              </Link>
              <Link 
                href={`/admin/dashboard/risks?${createQueryString({ status: "2", page: 1 })}`}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${currentStatus === '2' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                รอตรวจสอบ
              </Link>
            </div>
          </div>
        </div>

        {/* --- Table Section (เหมือนเดิมแต่ปรับแก้ URL รายละเอียด) --- */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">วันที่และเวลา</th>
                  <th className="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">หน่วยงาน</th>
                  <th className="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">รายละเอียด</th>
                  <th className="p-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {risks.map((risk) => (
                  <tr key={risk.riskid} className="hover:bg-blue-50/30 transition-all group">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700">
                          {risk.daterigter?.toLocaleDateString('th-TH')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: #{risk.riskid}</span>
                      </div>
                    </td>
                    <td className="p-6">
                       <span className="text-xs font-bold text-slate-600">{risk.depreport}</span>
                    </td>
                    <td className="p-6">
                      <p className="text-sm text-slate-600 font-medium max-w-md truncate">{risk.risktype}</p>
                    </td>
                    <td className="p-6 text-center">
                      <Link href={`/admin/dashboard/risks/${risk.riskid}`}>
                        <button className="bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-black px-5 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                          <Search size={14} className="inline mr-2" /> ตรวจสอบ
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- Pagination --- */}
         <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
  <p className="text-xs font-bold text-slate-400 uppercase">
    หน้า {currentPage} จาก {totalPages}
  </p>
  
  <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200">
    {/* ปุ่มย้อนกลับ */}
    <Link 
      href={`/admin/dashboard/risks?${createQueryString({ page: currentPage - 1 })}`}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${currentPage <= 1 ? 'pointer-events-none text-slate-200' : 'hover:bg-slate-100 text-slate-600'}`}
    >
      <ChevronLeft size={20} />
    </Link>

    {/* ส่วนตัวเลขหน้า */}
    {(() => {
      const pages = [];
      const range = 1; // จำนวนหน้าที่แสดงข้างๆ หน้าปัจจุบัน

      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 || // หน้าแรก
          i === totalPages || // หน้าสุดท้าย
          (i >= currentPage - range && i <= currentPage + range) // หน้ารอบๆ ปัจจุบัน
        ) {
          pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
          pages.push('...');
        }
      }

      return pages.map((p, idx) => {
        if (p === '...') {
          return (
            <span key={`dots-${idx}`} className="w-8 text-center text-slate-300 font-bold">
              ...
            </span>
          );
        }

        return (
          <Link
            key={p}
            href={`/admin/dashboard/risks?${createQueryString({ page: p })}`}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
              currentPage === p 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
          >
            {p}
          </Link>
        );
      });
    })()}

    {/* ปุ่มถัดไป */}
    <Link 
      href={`/admin/dashboard/risks?${createQueryString({ page: currentPage + 1 })}`}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${currentPage >= totalPages ? 'pointer-events-none text-slate-200' : 'hover:bg-slate-100 text-slate-600'}`}
    >
      <ChevronRight size={20} />
    </Link>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}