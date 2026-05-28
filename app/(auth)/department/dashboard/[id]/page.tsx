import { prisma } from "@/lib/prisma"; 
import { notFound } from "next/navigation";
import { DrugErrorTooltip } from "../components/Tooltip";
import PrintButton from "../components/ptintButton";
import RiskPrintTemplate from "../components/RiskPrinterTemplate";
import CloseTabButton from "../components/CloseTabButton";


export default async function RiskDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params; 
  const id = Number(resolvedParams.id);


  if (isNaN(id)) return notFound();

  // 1. ดึงข้อมูลอุบัติการณ์
const risk = await prisma.riskmain.update({
    where: { riskid: id },
    data: { is_read: true },
  });

  if (!risk) return notFound();

  // 2. ดึง Options จาก API (เรียกใช้ผ่าน URL เต็ม หรือดึงจาก DB โดยตรง)
  // ใน Server Component แนะนำให้ดึงจาก DB โดยตรงจะเร็วกว่าครับ
const severityData = await prisma.riskgrouplv.findMany({
    orderBy: { grlvcode: 'asc' }
  });

  const severityClinic = severityData.filter((s: any) => s.groupcode === 'clinic');
  const severityGen = severityData.filter((s: any) => s.groupcode === 'gen');

  const options = { severityClinic, severityGen };

    const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  "1": { 
    label: "● รอการตรวจสอบ", 
    class: "bg-slate-500/10 border-slate-500 text-slate-500" 
  },
  "2": { 
    label: "● หัวหน้างานตรวจสอบแล้ว", 
    class: "bg-amber-500/10 border-amber-500 text-amber-500" 
  },
  "3": { 
    label: "● ส่งต่อหัวหน้างาน", 
    class: "bg-blue-500/10 border-blue-500 text-blue-500" 
  },
  "4": { 
    label: "● ผู้บริหารตรวจสอบแล้ว", 
    class: "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
  },
};

  // --- ฟังก์ชันหา Code สำหรับแสดงผลบนหน้าจอ ---
  const getCode = (name: string, type: 'clinic' | 'gen') => {
    const source = type === 'clinic' ? severityClinic : severityGen;
    const found = source.find((s: any) => s.grlvname === name);
    return found ? `[${found.grlvcode}] ` : "";
  };



const currentStatus = STATUS_CONFIG[String(risk.riskstatus)] || STATUS_CONFIG["1"];
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 🖥️ ส่วนแสดงผลบนหน้าจอ (ไม่ปรากฏตอนพิมพ์) */}
      <div className="no-print p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <main>
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <CloseTabButton />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Incident ID: {risk.riskid}</span>
                <PrintButton />
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <div className="bg-[#1e293b] p-8 text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1 text-white">ข้อมูลรายละเอียดอุบัติการณ์</h1>
                    <p className="text-slate-400 text-sm">ตรวจสอบและวิเคราะห์สาเหตุเพื่อการพัฒนาองค์กร</p>
                  </div>
                  <div className={`px-6 py-2 rounded-2xl text-sm font-bold border-2 ${
                    risk.riskstatus === '1' 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                    : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                  }`}>
                   {currentStatus.label}
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-10">
                {/* Zone 1: ข้อมูลผู้ประสบปัญหา */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-slate-800">ข้อมูลผู้ประสบปัญหา</h2>
                  </div>
                  <div className="grid grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <InfoItem label="ชื่อผู้ประสบปัญหา" value={risk.riskname ?? "-"} />
                    <InfoItem label="HN" value={risk.riskhn ?? "-"} highlight />
                    <InfoItem label="อายุ" value={`${risk.riskage || '-'} ปี`} />
                    <InfoItem label="วันที่เกิดเหตุ" value={risk.daterigter ? new Date(risk.daterigter).toLocaleDateString('th-TH') : '-'} />
                    <InfoItem label="เวลา" value={risk.timepicker instanceof Date ? risk.timepicker.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : String(risk.timepicker ?? "-")} />
                    <InfoItem label="จากหน่วยงาน" value={risk.depreport ?? "-"} />
                    <InfoItem label="ถึงหน่วยงาน" value={risk.todep ?? "-"} />
                  </div>
                </section>

                {/* Zone 2: รูปแบบเหตุการณ์และความรุนแรง */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                      <h2 className="text-lg font-bold text-slate-800">รูปแบบเหตุการณ์</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-base font-bold text-slate-400 uppercase">ประเภทความเสี่ยง</span>
                          <p className="text-blue-600 font-bold text-lg">{risk.risktype ?? "-"}</p>
                          <div className="mt-3 pt-3 border-t border-slate-50">
                            <span className="text-base font-medium text-slate-400 uppercase">รายละเอียด <DrugErrorTooltip label="ข้อมูลความคลาดเคลื่อนทางยา" description="PE: Perscribing Error, PDE: Pre-dispensing Error, DE: Dispensing Error, AE: Administrating Error" /></span>
                            <p className="text-slate-700 font-medium">{risk.risktypedt ?? "-"}</p>
                          </div>
                        </div>
                      </div>

                      {/* ยา Error */}
                      {(risk.risktypedrug || risk.risktypedrugdt) && (
                        <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="font-bold text-blue-700 underline">รายละเอียดความคลาดเคลื่อนทางยา</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs font-bold text-blue-400 uppercase">ประเภท (Drug Error)</span>
                              <p className="text-slate-700 font-bold text-sm">{risk.risktypedrug ?? "-"}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-blue-400 uppercase">ประเภทย่อยทางยา</span>
                              <p className="text-slate-700 font-bold text-sm">{risk.risktypedrugdt ?? "-"}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ระดับความรุนแรง */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 bg-rose-600 rounded-full"></div>
                      <h2 className="text-lg font-bold text-slate-800">ระดับความรุนแรง</h2>
                    </div>
                    <div className="bg-rose-50/50 p-6 rounded-3xl border-2 border-rose-100 shadow-sm flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 uppercase font-bold">สรุประดับความรุนแรง:</span>
                        <p className="font-bold text-rose-600 text-base">
                          {[risk.risktypedrug, risk.risktypedrugdt, risk.clinicseverity].filter(Boolean).join(" / ") || "-"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 pt-2 border-t border-rose-100">
                        <span className="text-xs text-slate-500 uppercase font-bold">ระดับความรุนแรงทั่วไป:</span>
                        <p className="font-bold text-slate-700 text-sm">{risk.genseverity ?? "ไม่มี"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Zone 3: การวิเคราะห์ */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-slate-800">บรรยายเหตุการณ์และการวิเคราะห์</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-3">บรรยายสรุปเหตุการณ์</span>
                      <div className="text-slate-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: risk.riskpresent || "-" }} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-600 uppercase block mb-2">การแก้ไขเบื้องต้น</span>
                        {risk.riskfirstedit && risk.riskfirstedit.trim() !== "" && risk.riskfirstedit !== "<br>" 
                        ?  <div className="text-slate-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: risk.riskfirstedit || "-" }} />
                        : "-"} 
                      </div>
                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                          <span className="text-xs font-bold text-blue-600 uppercase block mb-2">
                            วิเคราะห์สาเหตุ
                          </span>
                          <p className="text-slate-700 text-xs leading-relaxed">
                            {risk.riskcauseanalysis && risk.riskcauseanalysis.trim() !== "" 
                              ? <div className="text-slate-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: risk.riskcauseanalysis || "-" }} />
                              : "ไม่มีการวิเคราะห์สาเหตุ"}
                          </p>
                        </div>
                  
                      
                    </div>
                  </div>
                </section>

               <section className="space-y-6">
                 
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-3">ความเห็นของหัวหน้างาน</span>
                       
                          <p className="text-slate-700 text-xs leading-relaxed">
                             {risk.riskresultedit && risk.riskresultedit.trim() !== "" 
                              ? <div className="text-slate-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: risk.riskresultedit || "-" }} />
                              : "-"}
                          </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                        <span className="text-xs font-bold text-amber-600 uppercase block mb-2">หมายเหตุ</span>
                        {risk.risknote && risk.risknote.trim() !== "" && risk.risknote !== "<br>" 
                        ?  <div className="text-slate-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: risk.risknote || "-" }} />
                        : "-"} 
                      </div>
                        <div className="p-5 bg-pink-50/50 rounded-2xl border border-pink-100">
                          <span className="text-xs font-bold text-pink-600 uppercase block mb-2">
                            ความเห็นของผู้บริหาร
                          </span>
                          <p className="text-slate-700 text-xs leading-relaxed">
                            {risk.riskcommenthead && risk.riskcommenthead.trim() !== "" 
                              ? <div className="text-slate-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: risk.riskcommenthead || "-" }} />
                              : "-"}
                          </p>
                        </div>
                  
                      
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 📠 ส่วนสำหรับพิมพ์เท่านั้น (จะแสดงผลผ่าน CSS Isolation) */}
      <div className="print-only-container">
        <RiskPrintTemplate risk={risk} />
      </div>

    </div>
  );
}

function InfoItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-blue-600' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}