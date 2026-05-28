import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SettingsTabs from "./components/SettingsTabs";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  // เช็คสิทธิ์เบื้องต้น (เช่น ต้องเป็น Admin เท่านั้นถึงเข้าหน้านี้ได้)
  if (!session) redirect("/login");
  // ตัวอย่างการเช็ค Level: if (session.user.level !== "9") redirect("/");

  const [
    users, 
    riskGroups, 
    riskGroupDts, 
    riskGroupLvs, 
    auditLogs, 
    auditTotal, 
    totalRisks, 
    sysConfig
  ] = await Promise.all([
    prisma.riskdepart.findMany({ 
      orderBy: { depid: "asc" }, 
      select: { depid: true, depname: true, depuser: true, deplevel: true } 
    }),
    prisma.riskgroup.findMany({ orderBy: { grid: "asc" } }),
    prisma.riskgroupdt.findMany({ orderBy: { dtgrid: "asc" } }),
    prisma.riskgrouplv.findMany({ orderBy: { grlvid: "asc" } }),
    prisma.auditlog.findMany({ 
      orderBy: { createdAt: "desc" }, 
      take: 100 // ดึงมาเผื่อหน้า UI สัก 100 รายการ
    }),
    prisma.auditlog.count(),
    prisma.riskmain.count(),
    prisma.$queryRaw<any[]>`
      SELECT "key", "value" FROM "Systemconfig" 
      WHERE "key" IN ('hospital_name','hospital_subname','logo_url')
    `.catch(() => []),
  ]);

  // Helper function สำหรับดึงค่าจาก Systemconfig
  const getConfigValue = (key: string) => {
    return sysConfig.find((c) => c.key === key)?.value ?? "";
  };

  return (
    <div className="p-6 md:p-10 w-full mx-auto">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">ตั้งค่าระบบ</h1>
        <p className="text-slate-400 font-medium">จัดการข้อมูลพื้นฐาน ผู้ใช้งาน และตั้งค่าองค์กร</p>
      </div> */}

      <SettingsTabs
        users={users}
        riskGroups={riskGroups}
        riskGroupDts={riskGroupDts}
        riskGroupLvs={riskGroupLvs}
        slaDays={7}
        nearMissCode=""
        auditLogs={auditLogs}
        auditTotal={auditTotal}
        totalRisks={totalRisks}
        totalUsers={users.length}
        hospitalName={getConfigValue("hospital_name")}
        hospitalSubname={getConfigValue("hospital_subname")}
        logoUrl={getConfigValue("logo_url")}
        appVersion="1.0.2-beta" // ขยับเวอร์ชันหน่อย
        dbVersion="PostgreSQL 15"
      />
    </div>
  );
}