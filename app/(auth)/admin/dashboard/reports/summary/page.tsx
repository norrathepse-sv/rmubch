import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SummaryClient from "./SumaryClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// เราจะสร้างไฟล์นี้แยกเพื่อทำกราฟ

export default async function SummaryReportPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

const userDep = session.user.department; // "admin"
  const userLv = String(session.user.deplevel || ""); // ใช้ .level แทน .deplevel
  const isAdmin = userLv === "9" || session.user.role === "ADMIN";

  // เช็ค Log อีกครั้งเพื่อความชัวร์
  console.log("User Level:", userLv); 
  console.log("Is Admin:", isAdmin);
  console.log("User Level:", userLv);
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
  <div className="p-6 bg-[#f8fafc] min-h-screen">
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-5">
          {/* Back Button with subtle shadow and hover effect */}
          <Link
            href={isAdmin ? "/admin/dashboard" : "/department/dashboard"}
            className="group p-3 bg-white rounded-2xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all border border-slate-200 active:scale-95"
          >
            <ArrowLeft size={22} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
          </Link>

          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              สรุปภาพรวม<span className="text-blue-600">ความเสี่ยง</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1 w-8 bg-blue-500 rounded-full"></span>
              <p className="text-slate-500 font-medium">วิเคราะห์ระดับความรุนแรงและประเภทอุบัติการณ์ในแผนก</p>
            </div>
          </div>
        </div>

        {/* ส่วนนี้สามารถเพิ่มปุ่ม Export หรือ Filter วันที่ได้ในอนาคต */}
        <div className="flex gap-2">
           {/* ตัวอย่าง: <button className="...">Export PDF</button> */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-200 p-2 shadow-inner">
        <div className="bg-white rounded-[1.8rem] shadow-sm p-6 md:p-8 border border-slate-100">
          {/* ส่งข้อมูลไปแสดงผลที่ Client Component */}
          <SummaryClient
            severityData={severityStats} 
            categoryData={categoryStats} 
          />
        </div>
      </div>

      {/* Footer Info (Optional) */}
      <p className="text-center text-slate-400 text-xs mt-8">
        ข้อมูลอัปเดตล่าสุด ณ วันที่ {new Date().toLocaleDateString('th-TH')}
      </p>
    </div>
  </div>
);
}