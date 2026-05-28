import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import React from "react";
import ExportButtonGroup from "./ExportButtonGroup";

interface IncidenceSummaryProps {
  from?: string;
  to?: string;
  dept?: string;
  severity?: string;
}

export default async function IncidenceSummary({ from, to, dept, severity }: IncidenceSummaryProps) {
  const where: any = {};
  
  if (from || to) {
    where.daterigter = {};
    if (from) where.daterigter.gte = new Date(`${from}T00:00:00Z`);
    if (to) where.daterigter.lte = new Date(`${to}T23:59:59Z`);
  }
  if (dept && dept !== "ทุกแผนก") where.depreport = dept;

  const rawIncidents = await prisma.riskmain.findMany({
    where,
    select: {
      riskid: true,
      risktype: true,
      risktypedt: true,
      riskname: true,
      clinicseverity: true,
      genseverity: true,
      riskpresent: true
    },
    orderBy: { riskid: "desc" },
  });

  // --- 1. Mapping 8 โปรแกรมความเสี่ยงหลักตามที่ระบุ ---
  const groupNames: Record<string, string> = {
    "1": "1. โปรแกรมความเสี่ยงทางคลินิก",
    "5": "2. โปรแกรมความเสี่ยงด้านระบบการติดเชื้อ",
    "4": "3. โปรแกรมความเสี่ยงอาชีวอนามัยและความปลอดภัยของเจ้าหน้าที่",
    "2": "4. โปรแกรมความเสี่ยงด้านระบบยา เคมีบำบัด สารน้ำและส่วนประกอบของเลือด",
    "12": "4. โปรแกรมความเสี่ยงด้านระบบยา เคมีบำบัด สารน้ำและส่วนประกอบของเลือด",
    "14": "4. โปรแกรมความเสี่ยงด้านระบบยา เคมีบำบัด สารน้ำและส่วนประกอบของเลือด",
    "15": "4. โปรแกรมความเสี่ยงด้านระบบยา เคมีบำบัด สารน้ำและส่วนประกอบของเลือด",
    "16": "4. โปรแกรมความเสี่ยงด้านระบบยา เคมีบำบัด สารน้ำและส่วนประกอบของเลือด",
    "17": "4. โปรแกรมความเสี่ยงด้านระบบยา เคมีบำบัด สารน้ำและส่วนประกอบของเลือด",
    "7": "5. โปรแกรมความเสี่ยงด้านโครงสร้างทางกายภาพ สิ่งแวดล้อมและความปลอดภัย",
    "8": "6. โปรแกรมความเสี่ยงด้านเครื่องมือ /อุปกรณ์",
    "6": "7. โปรแกรมความเสี่ยงข้อร้องเรียน สิทธิผู้ป่วย การเงิน",
    "9": "8. โปรแกรมความเสี่ยงระบบข้อมูล / IT /เวชระเบียน /การติดต่อสื่อสาร/ สิทธิบัตร",
    "18": "8. โปรแกรมความเสี่ยงระบบข้อมูล / IT /เวชระเบียน /การติดต่อสื่อสาร/ สิทธิบัตร",
  };

const groupedData: Record<string, { total: number; subCategories: Record<string, any[]> }> = {};

  rawIncidents.forEach((item) => {
    const mainTypeTitle = item.risktype ? (groupNames[item.risktype] || `(${item.risktype})`) : "ไม่ระบุหมวดหมู่";
    const subType = item.risktypedt || "ไม่ระบุหมวดย่อย";
    
    if (!groupedData[mainTypeTitle]) {
      groupedData[mainTypeTitle] = { total: 0, subCategories: {} };
    }
    if (!groupedData[mainTypeTitle].subCategories[subType]) {
      groupedData[mainTypeTitle].subCategories[subType] = [];
    }

   
  // --- ตรวจสอบว่ามีเคสที่ "รายละเอียด" และ "ระดับ" เหมือนกันเป๊ะๆ หรือยัง ---
const existingCase = groupedData[mainTypeTitle].subCategories[subType].find(
  (c) => 
    c.riskpresent === item.riskpresent && 
    // เช็กระดับคลินิก (เอาเฉพาะตัวหน้ามาเทียบกัน)
    (c.clinicseverity?.toString().trim().charAt(0) === item.clinicseverity?.toString().trim().charAt(0)) &&
    // เช็กระดับทั่วไป (เอาเฉพาะตัวหน้ามาเทียบกัน)
    (c.genseverity?.toString().trim().charAt(0) === item.genseverity?.toString().trim().charAt(0))
);

    if (existingCase) {
      // ถ้ามีอยู่แล้ว ให้บวกจำนวนเพิ่ม (เราจะเพิ่ม property .count เข้าไปเอง)
      existingCase.count += 1;
    } else {
      // ถ้ายังไม่มี ให้ใส่เข้าไปใหม่และเริ่มนับที่ 1
    groupedData[mainTypeTitle].subCategories[subType].push({
    ...item,
    count: 1
  });
    }

    groupedData[mainTypeTitle].total += 1;
  });
const getSeverityColor = (val?: string | null) => {
  if (!val) return "text-slate-700";
  
  const code = val.toString().trim().charAt(0).toUpperCase();

  // กลุ่มทางคลินิก (A-I)
  if (["E", "F", "G", "H", "I"].includes(code)) return "text-red-600";
  if (["C", "D"].includes(code)) return "text-orange-500";
  if (["A", "B"].includes(code)) return "text-emerald-500";

  // กลุ่มทั่วไป (1-9)
  if (["4", "5", "6", "7", "8", "9"].includes(code)) return "text-red-600";
  if (["3"].includes(code)) return "text-orange-500";
  if (["1", "2"].includes(code)) return "text-emerald-500";
  
  return "text-slate-700";
};

  if (!from && !to && !dept) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mt-8 text-center text-slate-500">
        กรุณาเลือกช่วงวันที่ หรือแผนก เพื่อดูรายงานอุบัติการณ์
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mt-8">
      
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h3 className="font-bold text-slate-800 text-2xl tracking-tight">รายงานรายละเอียดอุบัติการณ์</h3>
          <p className="text-sm text-slate-500 mt-2">
            ข้อมูลระหว่างวันที่: <span className="font-semibold text-slate-700">{from ? dayjs(from).format("DD/MM/YYYY") : "เริ่มต้น"}</span> ถึง <span className="font-semibold text-slate-700">{to ? dayjs(to).format("DD/MM/YYYY") : "ปัจจุบัน"}</span>
            {dept && dept !== "ทุกแผนก" && <span className="ml-2">| แผนก: <span className="font-semibold text-slate-700">{dept}</span></span>}
          </p>
        </div>

        {Object.keys(groupedData).length > 0 && (
          <ExportButtonGroup 
            groupedData={groupedData} 
            groupNames={groupNames} 
            filenamePrefix="Incident_Report" 
          />
        )}
      </div>

      {Object.keys(groupedData).length === 0 ? (
        <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          ไม่มีข้อมูลอุบัติการณ์ในช่วงเวลาและแผนกที่เลือก
        </div>
      ) : (
        <div id="report-content" className="space-y-12 bg-white pt-2">
          
          <div className="hidden print:block mb-6">
            <h2 className="text-xl font-bold text-center">รายงานรายละเอียดอุบัติการณ์</h2>
            <p className="text-center text-sm mt-2">
              ระหว่างวันที่ {from ? dayjs(from).format("DD/MM/YYYY") : "เริ่มต้น"} ถึง {to ? dayjs(to).format("DD/MM/YYYY") : "ปัจจุบัน"}
            </p>
          </div>

          {Object.entries(groupedData)
            .sort(([keyA], [keyB]) => {
    // ลบทุกอย่างที่ไม่ใช่ตัวเลขออก เพื่อให้เหลือแค่เลขในวงเล็บมาเทียบกัน
    const numA = parseInt(keyA.replace(/[^0-9]/g, '')) || 999;
    const numB = parseInt(keyB.replace(/[^0-9]/g, '')) || 999;
    
    return numA - numB; // เรียงจาก (1) ไป (10)
  })
            .map(([mainTypeTitle, mainCatData], mainIndex) => {

              return (
                <div key={mainTypeTitle} className="space-y-4 page-break-inside-avoid">
                  <h4 className="font-bold text-blue-900 text-lg flex items-center gap-2 bg-blue-50/50 p-2 rounded-md">
                    {mainTypeTitle} 
                    <span className="text-sm font-normal text-slate-500 ml-auto">
                      (รวม {mainCatData.total} รายการ)
                    </span>
                  </h4>

                  <div className="overflow-hidden rounded-lg border border-slate-300">
                    <table className="w-full text-left text-sm border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300">
                          <th className="p-3 font-semibold text-slate-700 w-3/4 border-r border-slate-300">รายละเอียดอุบัติการณ์</th>
                          <th className="p-3 font-semibold text-slate-700 text-center w-24 border-r border-slate-300">ระดับ</th>
                          <th className="p-3 font-semibold text-slate-700 text-center w-24">จำนวน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {Object.entries(mainCatData.subCategories)
 .sort(([keyA], [keyB]) => {
    // ลบทุกอย่างที่ไม่ใช่ตัวเลขออก เพื่อให้เหลือแค่เลขในวงเล็บมาเทียบกัน
    const numA = parseInt(keyA.replace(/[^0-9]/g, '')) || 999;
    const numB = parseInt(keyB.replace(/[^0-9]/g, '')) || 999;
    
    return numA - numB; // เรียงจาก (1) ไป (10)
    })
                          .map(([subType, incidents], subIndex) => (
                            <React.Fragment key={subType}>
                              <tr className="bg-slate-50/80 font-bold">
                                <td colSpan={3} className="p-3 text-slate-800 border-b border-slate-200">
                                  {subType}
                                </td>
                              </tr>
                              {incidents.map((incident) => (
                                <tr key={incident.riskid} className="hover:bg-blue-50/30 transition-colors">
<td className="p-3 pl-8 text-slate-700 border-r border-slate-200">
  <span className="text-slate-400 mr-2">-</span> 
  {/* ล้าง Tag HTML และสัญลักษณ์พิเศษออก */}
  {incident.riskpresent
    ?.replace(/<[^>]*>/g, '') 
    ?.replace(/&nbsp;/g, ' ')
    ?.trim() || "ไม่มีรายละเอียด"}
</td>
<td className="p-3 text-center font-bold border-r border-slate-200">
  {/* ส่วนของ Clinic Severity (สีตาม A-I) */}
  {incident.clinicseverity && (
    <span className={getSeverityColor(incident.clinicseverity)}>
      {incident.clinicseverity.toString().trim().charAt(0).toUpperCase()}
    </span>
  )}

  {/* แสดงตัวคั่นถ้ามีข้อมูลทั้งคู่ */}
  {incident.clinicseverity && incident.genseverity && (
    <span className="text-slate-300 mx-1">/</span>
  )}

  {/* ส่วนของ General Severity (สีตาม 1-9) */}
  {incident.genseverity && (
    <span className={getSeverityColor(incident.genseverity)}>
      {incident.genseverity.toString().trim().charAt(0).toUpperCase()}
    </span>
  )}

  {/* กรณีว่างทั้งคู่ */}
  {!incident.clinicseverity && !incident.genseverity && "-"}
</td>
                                 <td className="p-3 text-center font-bold text-slate-700">
    {incident.count || 1}
  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

          {/* --- ส่วนสรุปท้ายรายงาน (สถิติ และ RCA2) --- */}
   
        </div>
      )}
    </div>
  );
}