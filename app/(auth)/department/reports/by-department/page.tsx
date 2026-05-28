// app/(auth)/department/reports/by-department/page.tsx

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RankingList from "./components/RankingList";

export default async function ByDepartmentReport() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const userDep = session.user.department;

  // ✅ 1. จำนวนรายการทั้งหมด (incident จริง)
  const totalRecords = await prisma.riskmain.count();

  // ✅ 2. จำนวนต่อแผนก (ใช้ depreport เท่านั้น)
  const departmentStats = await prisma.riskmain.groupBy({
    by: ["depreport"],
    _count: { riskid: true },
  });

  // ✅ 3. sort ranking
  const sortedStats = departmentStats.sort(
    (a, b) => b._count.riskid - a._count.riskid
  );

  // ✅ 4. หาอันดับของหน่วยงานเรา
  const myDeptIndex = sortedStats.findIndex(
    (stat) => stat.depreport === userDep
  );

  // ✅ 5. top department
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
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                สรุปอุบัติการณ์แยกตามหน่วยงาน
              </h1>
              <p className="text-sm text-slate-500">
                จำนวนรายการและอันดับของแต่ละแผนก
              </p>
            </div>
          </div>

          <div className="text-sm font-medium px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">
            หน่วยงานของคุณ: {userDep}
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* รายการทั้งหมด */}
          <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
            <p className="text-xs text-slate-500 uppercase">
              รายการทั้งหมด
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {totalRecords.toLocaleString()}
              <span className="text-sm text-slate-400"> รายการ</span>
            </p>
          </div>

          {/* จำนวนแผนก */}
          <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
            <p className="text-xs text-slate-500 uppercase">
              หน่วยงานทั้งหมด
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {departmentStats.length}
              <span className="text-sm text-slate-400"> แผนก</span>
            </p>
          </div>

          {/* Top */}
          <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm text-blue-700 bg-blue-50/50 border-blue-100">
            <p className="text-xs uppercase text-blue-500">
              รายงานสูงสุด
            </p>
            <p className="text-lg font-bold mt-1 truncate">
              {topDepartment}
            </p>
          </div>

        </div>

        {/* Ranking */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">
              ลำดับการรายงานแยกตามหน่วยงาน
            </h2>

            {myDeptIndex !== -1 && (
              <a
                href="#my-dept-row"
                className="text-[11px] bg-blue-600 text-white px-3 py-2 rounded"
              >
                ดูหน่วยงานของฉัน (อันดับ {myDeptIndex + 1})
              </a>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[600px]">
            <RankingList
              stats={sortedStats}
              userDep={userDep as string}
            />
          </div>
        </div>

      </div>
    </div>
  );
}