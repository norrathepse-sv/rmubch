export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from "@/lib/prisma";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DepartmentBarChart from "./components/DepartmentBarchart";
import Link from "next/link";
import ExportButton from "./components/ExportButton";
import DashboardFilterBar from "./components/DashboardFilterBar";
import MonthlyTrendChart from "./components/MonthlyTrendChart";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Suspense } from "react";
import IncidenceSummary from "./reports/components/IncidenceSummary";

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = "Asia/Bangkok";

// ── Helper: แปลง searchParams severity → Prisma where ──
function severityWhere(severity?: string) {
  if (!severity) return {};
  const map: Record<string, object> = {
    low: { clinicseverity: { in: ['A', 'B', 'C', 'D'] } },
    high: { clinicseverity: { in: ['E', 'F', 'G', 'H', 'I'] } },
    gen_low: { genseverity: { in: ['1', '2'] } },
    gen_high: { genseverity: { in: ['3', '4', '5', '6', '7', '8', '9'] } },
  };
  return map[severity] ?? {};
}

function buildWhere(params: Record<string, string>) {
 const where: any = {};

if (params.from || params.to) {
    where.daterigter = {};
    
    if (params.from) {
      // เดิม: .toDate() -> จะได้ 2026-04-30T17:00... (ผิด)
      // ใหม่: ใช้ String ISO ระบุเวลาไทย 00:00
      where.daterigter.gte =new Date(`${params.from}T00:00:00Z`);
      console.log("From (ISO):", `${params.from}T00:00:00+07:00Z`, "Parsed:", where.daterigter.gte);
    }
    
    if (params.to) {
      // ใหม่: ใช้ String ISO ระบุเวลาไทย 23:59
      where.daterigter.lte = new Date(`${params.to}T23:59:59Z`);
      console.log("To (ISO):", `${params.to}T23:59:59+07:00Z`, "Parsed:", where.daterigter.lte);
    }
  }
  if (params.dept && params.dept !== "ทุกแผนก") where.depreport = params.dept;
  Object.assign(where, severityWhere(params.severity));
  return where;
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = await searchParams;
  const sp = (k: string) => resolvedParams[k] ?? "";

  const session = await getServerSession(authOptions);
  // ตรวจสอบ role และ deplevel (ปรับตามโครงสร้าง DB คุณ)
  if ((session?.user as any).role !== "ADMIN" && (session?.user as any).deplevel !== "9") redirect("/");

  const params = { from: sp("from"), to: sp("to"), dept: sp("dept"), severity: sp("severity") };
  const where = buildWhere(params);

  // --- ดึงข้อมูลทั้งหมดด้วย Promise.all ---
 const [
  pendingCount,
  totalCount,
  topDepartmentsRaw,
  pendingCases,
  allDepartments,
  completedCount,
  trendDataRaw
] = await Promise.all([
  // 1. ยอดรอตรวจ (หัวหน้างานยังไม่ได้ลงความเห็น)
  prisma.riskmain.count({ 
    where: { ...where, riskcommenthead: null } 
  }),

  // 2. ยอดรวมตาม Filter (ยอดนี้จะเป็นฐานให้ Pending + Completed)
  prisma.riskmain.count({ where }),

  // 3. Top 10 Departments
  prisma.riskmain.groupBy({
    by: ["depreport"],
    _count: { riskid: true },
    where,
    orderBy: { _count: { riskid: "desc" } },
    take: 10
  }),

  // 4. รายการรอตรวจล่าสุด 5 รายการ (แสดงที่ตาราง Recent Pending)
  prisma.riskmain.findMany({
    where: { ...where, riskcommenthead: null },
    orderBy: { riskid: "desc" },
    take: 5
  }),

  // 5. รายชื่อแผนกทั้งหมดสำหรับ Filter (ไม่ต้องใช้ where วันที่)
  prisma.riskmain.findMany({
    distinct: ["depreport"],
    select: { depreport: true },
    where: { depreport: { not: null } }, // กรองแผนกที่เป็น null ออก
    orderBy: { depreport: "asc" }
  }),

  // 6. ยอดตรวจแล้ว (หัวหน้างานลงความเห็นเรียบร้อยแล้ว)
  prisma.riskmain.count({
    where: { ...where, riskcommenthead: { not: null } }
  }),

  // 7. ดึงวันที่เพื่อทำกราฟแนวโน้ม (ดึงเฉพาะ daterigter ตาม filter)
  prisma.riskmain.findMany({
    where,
    select: { daterigter: true },
  })
]);

  // --- ประมวลผลข้อมูลกราฟ (Client-side grouping) ---
  const MONTH_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  
  const monthlyMap = new Map();
  trendDataRaw.forEach(item => {
    if (item.daterigter) {
      const mKey = dayjs(item.daterigter).format("YYYY-MM");
      monthlyMap.set(mKey, (monthlyMap.get(mKey) || 0) + 1);
    }
  });

  const monthlyData = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({
      month: `${MONTH_TH[parseInt(month.split("-")[1]) - 1]} ${month.split("-")[0].slice(2)}`,
      count
    }));

const topDepartments = topDepartmentsRaw
  .filter(d => d.depreport && d.depreport.trim() !== "") // กรองชื่อแผนกที่เป็นค่าว่างออก
  .map(d => ({
    name: d.depreport,
    count: d._count.riskid
  }));
  const deptList = allDepartments.map((d) => d.depreport).filter((d): d is string => !!d);

  // เตรียม URL สำหรับ Cards
  const baseQueryParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && baseQueryParams.set(k, v));
  
  // const pendingUrl = `/admin/dashboard/risks/list?${baseQueryParams.toString()}&status=2`;
  // const totalUrl = `/admin/dashboard/risks/list?${baseQueryParams.toString()}`;
  // const completedUrl = `/admin/dashboard/risks/list?${baseQueryParams.toString()}&status=4`;
  // 1. รายการรอตรวจ (pending) -> ส่งคำสั่งไปว่าเช็ค null
const pendingUrl = `/admin/dashboard/risks/list?${baseQueryParams.toString()}&filter=pending`;

// 2. รายการตรวจสอบแล้ว (completed) -> ส่งคำสั่งไปว่าเช็ค not null
const completedUrl = `/admin/dashboard/risks/list?${baseQueryParams.toString()}&filter=completed`;

// 3. รายการทั้งหมด
const totalUrl = `/admin/dashboard/risks/list?${baseQueryParams.toString()}`;

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <main className="container mx-auto p-8 space-y-6">
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Dashboard</h1>
          {/* ส่ง where ไปให้ ExportButton ไปดึงข้อมูลเองเมื่อกดปุ่ม */}
          {/* <ExportButton filters={where} total={totalCount} /> */}
        </div>

        <DashboardFilterBar
          departments={deptList}
          currentFrom={params.from}
          currentTo={params.to}
          currentDept={params.dept}
          currentSeverity={params.severity}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href={pendingUrl} className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-all">
            <div className="relative z-10">
              <p className="text-orange-600 font-black text-xs uppercase tracking-widest">ยังไม่ได้ตรวจ</p>
              <h2 className="text-6xl font-black text-slate-800 mt-4">{pendingCount}</h2>
              <p className="text-slate-400 text-xs mt-2 font-bold flex items-center gap-1">คลิกดูรายการ <ChevronRight size={14} /></p>
            </div>
            <Clock size={120} className="absolute -right-8 -bottom-8 text-orange-500/10 group-hover:scale-110 transition-transform" />
          </Link>

          <Link href={completedUrl} className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
            <div className="relative z-10">
              <p className="text-emerald-600 font-black text-xs uppercase tracking-widest">ตรวจสอบแล้ว</p>
              <h2 className="text-6xl font-black text-slate-800 mt-4">{completedCount}</h2>
              <p className="text-slate-400 text-xs mt-2 font-bold flex items-center gap-1">คลิกดูรายการ <ChevronRight size={14} /></p>
            </div>
            <CheckCircle2 size={120} className="absolute -right-8 -bottom-8 text-emerald-500/10 group-hover:scale-110 transition-transform" />
          </Link>

          <Link href={totalUrl} className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:bg-slate-800 transition-all">
            <div className="relative z-10 text-white">
              <p className="text-blue-400 font-black text-xs uppercase tracking-widest">ทั้งหมดที่กรอง</p>
              <h2 className="text-6xl font-black mt-4">{totalCount}</h2>
              <p className="text-slate-400 text-xs mt-2 font-bold flex items-center gap-1">ดูข้อมูลดิบทั้งหมด <ChevronRight size={14} /></p>
            </div>
            <TrendingUp size={120} className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
              <AlertCircle className="text-blue-500" size={20} /> Top 10 Departments
            </h3>
            <DepartmentBarChart data={topDepartments} />
          </div>
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={20} /> แนวโน้มการรายงาน
            </h3>
            <MonthlyTrendChart data={monthlyData} />
          </div>
        </div>

    

        {/* Recent Pending Table */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="font-black text-slate-800 text-xl tracking-tight">เคสล่าสุดที่รอการตรวจสอบ</h3>
            </div>
            <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-4 py-2 rounded-full border border-orange-100 uppercase tracking-tighter">
              ค้างรวม {pendingCount} รายการ
            </span>
          </div>

          <div className="overflow-x-auto -mx-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-y border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่เกิดเหตุ</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">หน่วยงาน</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">รายละเอียด</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingCases.map((item) => (
                  <tr key={item.riskid} className="group hover:bg-slate-50 transition-all">
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">
                      {item.daterigter ? dayjs(item.daterigter).format("DD/MM/YYYY") : "-"}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        {item.depreport}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-700 truncate max-w-[300px]">
                      {item.risktype?.replace(/<[^>]*>/g, '') || "ไม่มีหัวข้อ"}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <Link href={`/admin/dashboard/risks/${item.riskid}`} className="bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 px-4 py-2 hover:bg-slate-900 hover:text-white transition-all">
                        ตรวจสอบ
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
            <Suspense fallback={
          <div className="mt-8 p-8 text-center text-slate-500 animate-pulse bg-white rounded-[2.5rem] border border-slate-100">
            กำลังประมวลผล Incidence Summary...
          </div>
        }>
          <IncidenceSummary 
             from={params.from} 
             to={params.to} 
             dept={params.dept} 
             severity={params.severity} 
          />
        </Suspense>
      </main>
    </div>
  );
}