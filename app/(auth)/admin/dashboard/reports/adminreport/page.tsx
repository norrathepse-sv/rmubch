import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminRiskReportClient from "./components/AdminRiskReportClient";


// --- Helper: ฟังก์ชันสำหรับจัดการเงื่อนไขการกรอง (Reuse จาก Dashboard) ---
function buildWhereClause(params: any) {
  const andConditions: any[] = [];

  // --- กรองวันที่และแผนก (เหมือนเดิม) ---
  if (params.from || params.to) { /* ... */ }
  if (params.dept && params.dept !== "ทั้งหมด") {
    andConditions.push({ depreport: params.dept });
  }

  // --- 🚩 กรองระดับความรุนแรง (แก้ไขใหม่) ---
  if (params.severity && params.severity !== "ทั้งหมด") {
    const s = params.severity;
    
    if (s === "low") {
      andConditions.push({
        OR: ['A', 'B', 'C', 'D'].map(v => ({ clinicseverity: { startsWith: v } }))
      });
    } else if (s === "high") {
      andConditions.push({
        OR: ['E', 'F', 'G', 'H', 'I'].map(v => ({ clinicseverity: { startsWith: v } }))
      });
    } else if (s === "gen_low") {
      andConditions.push({
        OR: ['1', '2'].map(v => ({ genseverity: { startsWith: v } }))
      });
    } else if (s === "gen_high") {
      andConditions.push({
        OR: ['3', '4', '5', '6', '7', '8', '9'].map(v => ({ genseverity: { startsWith: v } }))
      });
    } else if (s.length === 1) {
      // 🚩 กรณีเลือก "ระดับ A" (ค่า s คือ 'A')
      andConditions.push({
        OR: [
          { clinicseverity: { startsWith: s } },
          { genseverity: { startsWith: s } }
        ]
      });
    }
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
}

export default async function AdminReportPage({ searchParams }: { searchParams: Promise<any> }) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);

  if ((session?.user as any).role !== "ADMIN") redirect("/");

  // 1. เตรียม Parameters
  const params = {
    from: sp.from || "",
    to: sp.to || "",
    dept: sp.dept || "ทั้งหมด",
    severity: sp.severity || "ทั้งหมด",
    status: sp.status || "ทั้งหมด",
  };

  const where = buildWhereClause(params);

  // 2. ดึงข้อมูลจาก Database พร้อมกันแบบ Parallel
  const [stats, allIncidents, departments] = await Promise.all([
    // สถิติแยกตามหน่วยงาน (สำหรับกราฟ)
    prisma.riskmain.groupBy({
      by: ['depreport'],
      _count: { riskid: true },
      where,
      orderBy: { _count: { riskid: 'desc' } },
      take: 10
    }),
    // รายการทั้งหมดตามเงื่อนไข (สำหรับตาราง)
    prisma.riskmain.findMany({
      where,
      orderBy: { riskid: 'desc' },
      take: 500 // จำกัดจำนวนเพื่อ Performance
    }),
    // รายชื่อแผนกทั้งหมด (สำหรับ Dropdown Filter)
    prisma.riskmain.findMany({
      distinct: ['depreport'],
      select: { depreport: true },
      orderBy: { depreport: 'asc' }
    })
  ]);

  // 3. จัดการรูปแบบข้อมูลก่อนส่งให้ Client
  const totalIncidents = allIncidents.length;
  const deptList = departments.map(d => d.depreport).filter(Boolean) as string[];

  const formattedIncidents = allIncidents.map(item => ({
    id: String(item.riskid),
    reportDate: item.daterigter?.toLocaleDateString("th-TH") || "",
    incidentDate: item.daterigter?.toLocaleDateString("th-TH") || "",
    department: item.depreport || "ไม่ระบุ",
    riskCategory: item.risktype || "ทั่วไป",
    severity: item.clinicseverity || item.genseverity || "-",
    status: (item.riskdaterespon) ? "ทบทวนแล้ว" : "รอทบทวน",
    reporterName: item.riskname || "ไม่ระบุ"
  }));

  return (
    <AdminRiskReportClient
      stats={stats}
      totalIncidents={totalIncidents}
      incidents={formattedIncidents}
      departments={deptList}
      currentParams={params}
    />
  );
}