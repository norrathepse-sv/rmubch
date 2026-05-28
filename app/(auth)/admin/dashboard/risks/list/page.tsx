// บังคับให้โหลดข้อมูลใหม่เสมอ ป้องกันปัญหา Cache ข้อมูลเก่า
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import RiskListClient from "../components/RisklistClient";
import { redirect } from "next/navigation";
import dayjs from "dayjs";

export default async function RiskListPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    page?: string; 
    from?: string; 
    to?: string; 
    dept?: string; 
    filter?: string; 
    severity?: string; 
  }> 
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any).role !== "ADMIN") redirect("/");

  const sParams = await searchParams;
  const currentPage = Number(sParams.page) || 1;
  const rowsPerPage = 10;

  console.log("\n================ DEBUG START ================");
  console.log("1. ค่า Params ที่รับมาจาก URL:", sParams);

  // --- แอบดูข้อมูล 1 ตัวใน Database ว่ามันเขียนว่าอะไร ---
  const sampleData = await prisma.riskmain.findFirst({
    select: { riskid: true, clinicseverity: true },
    orderBy: { riskid: 'desc' }
  });
  // console.log("2. ตัวอย่างข้อมูลจริงใน DB (ล่าสุด):", sampleData);

  // --- 1. สร้างเงื่อนไข Where ---
  const where: any = {};

  if (sParams.from || sParams.to) {
    where.daterigter = {};
    if (sParams.from) where.daterigter.gte = new Date(`${sParams.from}T00:00:00Z`);
    if (sParams.to) where.daterigter.lte = new Date(`${sParams.to}T23:59:59Z`);
  }
  
  if (sParams.dept && sParams.dept !== "ทุกแผนก") {
    where.depreport = sParams.dept;
  }

  if (sParams.filter === "completed") { 
    where.riskcommenthead = { not: null };
  } else if (sParams.filter === "pending") { 
    where.riskcommenthead = null;
  }

  // --- ระบบ Filter ความรุนแรง ---
  if (sParams.severity === "high") {
    where.OR = [
      { clinicseverity: { startsWith: "E" } },
      { clinicseverity: { startsWith: "F" } },
      { clinicseverity: { startsWith: "G" } },
      { clinicseverity: { startsWith: "H" } },
      { clinicseverity: { startsWith: "I" } },
    ];
  } else if (sParams.severity === "low") {
    where.OR = [
      { clinicseverity: { startsWith: "A" } },
      { clinicseverity: { startsWith: "B" } },
      { clinicseverity: { startsWith: "C" } },
      { clinicseverity: { startsWith: "D" } },
    ];
  }

 
  
  // --- 2. Query ข้อมูล ---
  try {
    const [risksRaw, totalCount, allRisksForExport] = await Promise.all([
      prisma.riskmain.findMany({
        where,
        orderBy: { riskid: 'desc' },
        skip: (currentPage - 1) * rowsPerPage,
        take: rowsPerPage,
      }),
      prisma.riskmain.count({ where }),
      prisma.riskmain.findMany({
        where,
        orderBy: { riskid: 'desc' },
      })
    ]);

    // console.log(`4. ดึงข้อมูลสำเร็จ: ได้มา ${totalCount} รายการ`);

    const formatData = (data: any[]) => {
      return data.map(r => ({
        ...r,
        riskid: Number(r.riskid),
        daterigter: r.daterigter ? dayjs(r.daterigter).format("DD/MM/YYYY") : "-",
        timepicker: r.timepicker ? dayjs(r.timepicker).format("HH:mm") : "-",
        riskpresent: r.riskpresent ? r.riskpresent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : "-",
        riskfirstedit: r.riskfirstedit ? r.riskfirstedit.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : "-",
        riskresultedit: r.riskresultedit ? r.riskresultedit.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : "-",
        status_display: r.riskcommenthead ? "ตรวจสอบแล้ว" : "รอตรวจสอบ"
      }));
    };

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <RiskListClient 
            initialData={formatData(risksRaw)} 
            exportData={formatData(allRisksForExport)} 
            totalCount={totalCount} 
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / rowsPerPage)}
            filters={sParams}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดตอน Query Prisma:", error);
    return <div className="p-8 text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูล (ดูรายละเอียดใน Terminal)</div>;
  }
}