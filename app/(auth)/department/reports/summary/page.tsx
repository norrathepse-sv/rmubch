import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SummaryClient from "./SumaryClient";
// เราจะสร้างไฟล์นี้แยกเพื่อทำกราฟ

export default async function SummaryReportPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const userDep = session.user.department;

  // ดึงข้อมูลแยกตามระดับความรุนแรง (Level)
  const severityStats = await prisma.riskmain.groupBy({
  by: ['clinicseverity'], // เปลี่ยนจาก risk_level เป็น clinicseverity
  _count: { 
    riskid: true 
  },
  where: { 
    todep: userDep 
  },
});

// 2. ดึงข้อมูลแยกตามประเภทอุบัติการณ์ (ใช้ risktype)
const categoryStats = await prisma.riskmain.groupBy({
  by: ['risktype'], // เปลี่ยนจาก risk_type เป็น risktype
  _count: { 
    riskid: true 
  },
  where: { 
    todep: userDep 
  },
  orderBy: { 
    _count: { 
      riskid: 'desc' 
    } 
  },
  take: 5
});

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-slate-800 mb-2">สรุปภาพรวมความเสี่ยง</h1>
        <p className="text-slate-500 mb-8 font-medium">วิเคราะห์ระดับความรุนแรงและประเภทอุบัติการณ์ในแผนก</p>
        
        {/* ส่งข้อมูลไปแสดงผลที่ Client Component */}
        <SummaryClient
          severityData={severityStats} 
          categoryData={categoryStats} 
        />
      </div>
    </div>
  );
}