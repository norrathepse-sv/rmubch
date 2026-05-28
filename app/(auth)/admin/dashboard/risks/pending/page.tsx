// app/admin/dashboard/risks/pending/page.tsx

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import PendingTableClient from "./PendingTableClient";

// 1. เพิ่มฟังก์ชันนี้เข้าไปที่ด้านบนของไฟล์ (Copy จากหน้า Dashboard มาวางได้เลย)
function severityWhere(severity?: string) {
  if (!severity) return {};
  const map: Record<string, object> = {
    low:      { genseverity: "L" },
    medium:   { genseverity: "M" },
    high:     { OR: [{ genseverity: "H" }, { clinicseverity: "3" }] },
    critical: { OR: [{ genseverity: "I" }, { clinicseverity: "4" }, { clinicseverity: "5" }] },
  };
  return map[severity] ?? {};
}

export default async function PendingReviewPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    page?: string; 
    from?: string; 
    to?: string; 
    dept?: string; 
    severity?: string; 
  }> 
}) {
  const session = await getServerSession(authOptions);
  
  // เช็คสิทธิ์ (ใช้ตัวที่ตรงกับ Auth ของคุณ เช่น role หรือ deplevel)
  if ((session?.user as any).role !== "ADMIN") redirect("/");

  const sParams = await searchParams;
  const { from, to, dept, severity, page } = sParams; // กระจายตัวแปรออกมาใช้ง่ายๆ

  const currentPage = Number(page) || 1;
  const rowsPerPage = 10;

  // 2. สร้าง Where Clause
  const where: any = {
    riskstatus: "2",
    riskshow: "1",
  };

  // จัดการ Filter วันที่ (รับช่วงเวลาจาก Dashboard)
  if (from || to) {
    where.daterigter = {};
    if (from) where.daterigter.gte = new Date(from);
    if (to)   where.daterigter.lte = new Date(to + "T23:59:59");
  }

  if (dept) where.depreport = dept;

  // เรียกใช้ฟังก์ชันที่เพิ่งเพิ่มด้านบน
  const sevWhere = severityWhere(severity);
  Object.assign(where, sevWhere);

  const [totalCount, pendingRisks] = await Promise.all([
    prisma.riskmain.count({ where }),
    prisma.riskmain.findMany({
      where,
      orderBy: { riskid: 'desc' },
      skip: (currentPage - 1) * rowsPerPage,
      take: rowsPerPage,
    }),
  ]);

  return (
    <PendingTableClient
      initialData={pendingRisks} 
      totalCount={totalCount} 
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / rowsPerPage)}
      // ส่งค่ากลับไปเพื่อให้ Client คงค่า Filter ไว้ตอนเปลี่ยนหน้า
      filters={{ from, to, dept, severity }}
    />
  );
}