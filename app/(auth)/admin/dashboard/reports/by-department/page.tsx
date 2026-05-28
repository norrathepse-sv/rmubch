import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Users, ArrowLeft, BarChart } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ByDepartmentReport() {
  // 1. ตรวจสอบ Session และหน่วยงานของผู้ใช้
  const session = await getServerSession(authOptions);
  
  // เช็คทั้ง session และ user เพื่อป้องกัน Type Error 'session.user' is possibly 'undefined'
  if (!session || !session.user) {
    redirect("/");
  }

  // ดึงค่าออกมา (TypeScript จะรู้แล้วว่า session.user มีตัวตนแน่นอน)
  const userDep = session.user.department;
  const userLv = session.user.deplevel;
  const isAdmin = userLv === "9";
  
  // 2. ดึงข้อมูลสถิติ
  const departmentStats = await prisma.riskmain.groupBy({
    by: ['depreport'],
    _count: {
      riskid: true,
    },
    where: {
      todep: userDep || "", // ป้องกันกรณี userDep เป็น null/undefined
    },
    orderBy: {
      _count: {
        riskid: 'desc',
      },
    },
  });

  // คำนวณยอดรวมทั้งหมด
  const totalIncidents = departmentStats.reduce((acc, curr) => acc + curr._count.riskid, 0);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* Header ส่วนหัวหน้าจอ */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard" // ปรับให้กระชับขึ้นเพราะปลายทางเหมือนกัน
              className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">สถิติแยกตามหน่วยงาน</h1>
              <p className="text-slate-500 text-sm">ข้อมูลอุบัติการณ์ความเสี่ยงที่ได้รับจากแผนกต่างๆ</p>
            </div>
          </div>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2">
            <BarChart size={18} />
            <span className="font-bold text-lg">{totalIncidents.toLocaleString()}</span>
            <span className="text-xs opacity-80">รายการทั้งหมด</span>
          </div>
        </div>

        {/* ตารางแสดงผล */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">ลำดับ</th>
                <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">ชื่อหน่วยงานที่รายงาน</th>
                <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-center">จำนวน (ครั้ง)</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider w-1/3">สัดส่วน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentStats.map((stat, index) => {
                // กันการหารด้วยศูนย์
                const percentage = totalIncidents > 0 
                  ? ((stat._count.riskid / totalIncidents) * 100).toFixed(1) 
                  : "0.0";
                
                return (
                  <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-4">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${
                        index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></div>
                        <span className="font-semibold text-slate-700">{stat.depreport || "ไม่ระบุหน่วยงาน"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-blue-600 text-lg">
                      {stat._count.riskid.toLocaleString()}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-out ${
                              index === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 w-10">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {departmentStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Users size={64} />
                      <p className="text-xl font-bold italic">ยังไม่มีข้อมูลการรายงานเข้ามา</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* สรุปท้ายรายงาน */}
        {departmentStats.length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
            <div className="p-2 bg-amber-200 rounded-lg text-amber-700">
              <BarChart size={20} />
            </div>
            <div>
              <p className="text-amber-800 font-bold text-sm">ข้อสังเกต</p>
              <p className="text-amber-700 text-xs">
                หน่วยงานที่มีสถิติสูงสุดคือ <span className="underline font-black">{departmentStats[0]?.depreport || "N/A"}</span> 
                ควรมีการประสานงานเพื่อทบทวนมาตรการป้องกันความเสี่ยงร่วมกัน
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}