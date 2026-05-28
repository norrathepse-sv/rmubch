import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/th";

// Components
import EditRiskForm from "@/app/(auth)/department/dashboard/components/EditRiskForm";
import BackButton from "@/app/(auth)/department/dashboard/components/BackButton";

export default async function EditCommentPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  // 1. await params ก่อนนำมาใช้งาน
  const resolvedParams = await params;
  const riskId = parseInt(resolvedParams.id);

  // 2. เช็คว่าแปลงเลขสำเร็จหรือไม่
  if (isNaN(riskId)) {
    return notFound();
  }

  // 3. ดึงข้อมูลจาก Database
  const risk = await prisma.riskmain.findUnique({
    where: { 
      riskid: riskId 
    },
  });

  if (!risk) notFound();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 my-8 min-h-screen">
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการข้อมูลและข้อสั่งการ</h1>
          <p className="text-sm text-gray-500 mt-1">ตรวจสอบรายละเอียดอุบัติการณ์และบันทึกข้อมูลเพิ่มเติม</p>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ฝั่งซ้าย: รายละเอียดอุบัติการณ์ (Read-only) */}
        <div className="lg:col-span-4 space-y-6">
          {/* ใช้ sticky เพื่อให้กล่องนี้ตามลงมาเวลาเลื่อนหน้าจอฝั่งขวา */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
            <h3 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              สรุปอุบัติการณ์
            </h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">เลขที่รายการ</p>
                <div className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold">
                  #{risk.riskid}
                </div>
              </div>
              
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">เวลาที่เกิดเหตุ</p>
                <p className="text-sm text-gray-700 font-medium">
                  {risk.timepicker ? dayjs(risk.timepicker).format('HH:mm') : "-"} น.
                </p>
              </div>
              
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">ผู้ประสบปัญหา</p>
                <p className="text-sm text-gray-700 font-medium">
                  {risk.riskname || "ไม่ระบุ"}
                </p>
              </div>
              
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">เหตุการณ์โดยย่อ</p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mt-1">
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    {risk.riskpresent || "ไม่ได้ระบุรายละเอียด"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: ฟอร์มบันทึกข้อสั่งการ */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">ฟอร์มบันทึกความเสี่ยง</h3>
            <EditRiskForm initialData={risk} />
          </div>
        </div>
        
      </div>
    </div>
  );
}