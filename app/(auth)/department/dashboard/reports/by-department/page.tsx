// app/(auth)/department/reports/by-department/page.tsx

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RankingList from "./components/RankingList";
import RiskTopicSummary from "./components/RiskTopicSummary";
import RiskTrendAnalysis from "./components/RiskTrendAnalysis";
import FiscalYearSelect from "./components/FiscalYerSelect";
import SeverityCard from "./components/ServerityCard";

export default async function ByDepartmentReport({
  searchParams,
}: {
  searchParams: Promise<{ fiscalYear?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const userDep = session.user.department;
  const now = new Date();
  const currentYear = now.getFullYear();

  // ✅ 1. คำนวณปีงบประมาณ (ตุลาคมปีนี้ คือปีงบประมาณหน้า)
  const selectedFiscalYear = params.fiscalYear 
    ? Number(params.fiscalYear) 
    : (now.getMonth() >= 9 ? currentYear + 1 : currentYear);

  const getFiscalRange = (year: number) => ({
    start: new Date(`${year - 1}-10-01`),
    end: new Date(`${year}-09-30`),
  });

  const currentRange = getFiscalRange(selectedFiscalYear);
  const lastRange = getFiscalRange(selectedFiscalYear - 1);

  // ✅ 2. รวม Query ทั้งหมดเพื่อความเร็ว (Parallel)
const [
    totalRecords,
    departmentStats,
    inboundRiskStats,
    outboundRiskStats,
    currentYearRaw,
    lastYearRaw,
    severityStatsRaw,
    riskTypeGroupRaw
  ] = await Promise.all([
    prisma.riskmain.count(),
    prisma.riskmain.groupBy({
      by: ["depreport"],
      _count: { riskid: true },
    }),
    // 📥 Inbound: เพิ่ม "depreport" เพื่อดูว่าใครส่งมาหาหน่วยงานเรา
    prisma.riskmain.groupBy({
      by: ["risktype", "depreport"], 
      where: { todep: userDep, daterigter: { gte: currentRange.start, lte: currentRange.end } },
      _count: { riskid: true },
      orderBy: { _count: { riskid: "desc" } },
    }),
    // 📤 Outbound: เพิ่ม "todep" เพื่อดูว่าหน่วยงานเราส่งไปที่ไหน
    prisma.riskmain.groupBy({
      by: ["risktype", "todep"],
      where: { depreport: userDep, daterigter: { gte: currentRange.start, lte: currentRange.end } },
      _count: { riskid: true },
      orderBy: { _count: { riskid: "desc" } },
    }),
    prisma.riskmain.findMany({
      where: {
        OR: [{ todep: userDep }, { depreport: userDep }],
        daterigter: { gte: currentRange.start, lte: currentRange.end },
      },
      select: { daterigter: true }
    }),
    prisma.riskmain.findMany({
      where: {
        OR: [{ todep: userDep }, { depreport: userDep }],
        daterigter: { gte: lastRange.start, lte: lastRange.end },
      },
      select: { daterigter: true }
    }),
    prisma.riskmain.groupBy({
      by: ["clinicseverity"],
      where: {
        OR: [{ todep: userDep }, { depreport: userDep }],
        daterigter: { gte: currentRange.start, lte: currentRange.end },
        NOT: { clinicseverity: null }, // กันค่า null
        clinicseverity: { not: "" }    // กันค่าว่าง
      },
      _count: { riskid: true },
    }),
    prisma.riskmain.groupBy({
      by: ["risktype"],
      where: {
        OR: [{ todep: userDep }, { depreport: userDep }],
        daterigter: { gte: currentRange.start, lte: currentRange.end },
      },
      _count: { riskid: true },
    })
    
  ]);

const severityStats = severityStatsRaw.map(item => {
  const lv = (item.clinicseverity || "").toUpperCase(); // ใช้ชื่อฟิลด์จาก Schema คุณ
  
  // 1. กำหนดกลุ่มระดับความรุนแรงสูง (High Risk)
  const isHighRisk = ["E", "F", "G", "H", "I"].includes(lv);
  
  // 2. กำหนดกลุ่มข้อยกเว้น (Z หรือค่าว่าง)
  const isExcluded = lv === "z" || lv === "" || lv === "N/A";

  // 3. เลือกสีตามเงื่อนไข
  let barColor = "#3b82f6"; // Default: สีน้ำเงิน (A-D)
  
  if (isHighRisk) {
    barColor = "#ef4444"; // สีแดง (E ขึ้นไป)
  } else if (isExcluded) {
    barColor = "#94a3b8"; // สีเทา (Z หรือ N/A)
  }

  return {
    level: lv || "N/A",
    count: item._count.riskid,
    color: barColor // ✅ ส่งสีที่คำนวณแล้วไปให้ SeverityCard
  };
}).sort((a, b) => a.level.localeCompare(b.level));

  // ✅ 3. Helper Function: แปลงวันที่เป็น Array 12 เดือน (เริ่ม ต.ค. จบ ก.ย.)
  const formatFiscalMonthlyData = (rawItems: any[]) => {
    const months = new Array(12).fill(0);
    rawItems.forEach(item => {
      if (item.daterigter) {
        const m = new Date(item.daterigter).getMonth(); // 0=Jan, 9=Oct
        // สูตรแปลง: Oct(9)->0, Nov(10)->1, Dec(11)->2, Jan(0)->3 ... Sep(8)->11
        const fiscalIndex = (m + 3) % 12;
        months[fiscalIndex]++;
      }
    });
    return months;

  };

  // 1. ดึงปีทั้งหมดที่มีอยู่ในฟิลด์ daterigter
const yearsData = await prisma.riskmain.findMany({
  select: { daterigter: true },
  distinct: ['daterigter'], // เลือกเฉพาะวันที่ไม่ซ้ำ (เพื่อมาสกัดเอาปี)
});

// 2. คำนวณหาปีงบประมาณที่มีอยู่จริง (สกัดจากวันที่)
// วิธีคำนวณ: ถ้าเดือน >= ตุลาคม ให้ถือเป็นปีงบประมาณของปีถัดไป
const existingFiscalYears = Array.from(
  new Set(
    yearsData.map((item) => {
      if (!item.daterigter) return null;
      const date = new Date(item.daterigter);
      return date.getMonth() >= 9 ? date.getFullYear() + 1 : date.getFullYear();
    })
  )
)
  .filter((year): year is number => year !== null)
  .sort((a, b) => b - a); // เรียงจากปีล่าสุดลงไป

  

  const currentYearData = formatFiscalMonthlyData(currentYearRaw);
  const lastYearData = formatFiscalMonthlyData(lastYearRaw);

  const currentTotal = currentYearData.reduce((a, b) => a + b, 0);

  const sortedStats = [...departmentStats].sort((a, b) => b._count.riskid - a._count.riskid);
  const myDeptIndex = sortedStats.findIndex(stat => stat.depreport === userDep);
  const topDepartment = sortedStats[0]?.depreport || "-";



  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-700">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/department/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={24} />
            </Link>
 <FiscalYearSelect 
        existingFiscalYears={existingFiscalYears} 
        selectedFiscalYear={selectedFiscalYear} 
      />
          </div>
          <div className="text-sm font-medium px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">
            หน่วยงานของคุณ: {userDep}
          </div>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
            <p className="text-xs text-slate-500 uppercase">รายการทั้งหมด (ปีงบฯนี้)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{currentYearRaw.length.toLocaleString()} <span className="text-sm text-slate-400">รายการ</span></p>
          </div>
          <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
            <p className="text-xs text-slate-500 uppercase">หน่วยงานที่รายงานเข้ามา</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{departmentStats.length} <span className="text-sm text-slate-400">แผนก</span></p>
          </div>
          <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm bg-blue-50/30">
            <p className="text-xs uppercase text-blue-500 font-bold">Top Reporter</p>
            <p className="text-lg font-bold mt-1 truncate">{topDepartment}</p>
          </div>
        </div>

        {/* ✅ วิเคราะห์แนวโน้มรายเดือน (Trend Analysis) */}
    
  
  {/* การ์ดแนวโน้ม (ใช้พื้นที่ 8/12) */}
  
    <RiskTrendAnalysis 
      currentYearData={currentYearData} 
      lastYearData={lastYearData} 
      selectedYear={selectedFiscalYear}
    />

    <SeverityCard
      severityStats={severityStats} 
      totalCount={currentTotal} 
    />




        {/* ✅ สรุปหัวข้อความเสี่ยง Inbound/Outbound */}
        <RiskTopicSummary 
          inboundStats={inboundRiskStats} 
          outboundStats={outboundRiskStats} 
        />

        {/* ✅ ตารางอันดับ Ranking */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">ลำดับการรายงานแยกตามหน่วยงาน</h2>
            {myDeptIndex !== -1 && (
              <a href="#my-dept-row" className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold transition-all">
                ดูหน่วยงานของฉัน (อันดับ {myDeptIndex + 1})
              </a>
            )}
          </div>
          <div className="p-0 overflow-y-auto max-h-[600px]">
            <RankingList stats={sortedStats} userDep={userDep as string} />
          </div>
        </div>

      </div>
    </div>
  );
}