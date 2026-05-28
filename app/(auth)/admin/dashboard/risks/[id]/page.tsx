import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { 
  ShieldCheck, Send, User, MapPin, 
  Calendar, Clock, AlertCircle, FileText, Activity, 
  MessageSquare, Stethoscope, BriefcaseMedical
} from "lucide-react";
import { revalidatePath } from "next/cache";
import BackButton from "@/app/(auth)/department/dashboard/components/BackButton";
import dayjs from "dayjs";
import { DrugErrorTooltip } from "@/app/(auth)/department/dashboard/components/Tooltip";

export default async function RiskManagementPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ from?: string; to?: string; dept?: string; severity?: string }> 
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any).role !== "ADMIN") redirect("/");

  const { id } = await params;
  const sParams = await searchParams; 

  const risk = await prisma.riskmain.findUnique({
    where: { riskid: Number(id) }
  });

  if (!risk) notFound();

  // --- ส่วนการสร้าง URL ย้อนกลับแบบคงค่า Filter ---
  const backParams = new URLSearchParams();
  if (sParams.from) backParams.set("from", sParams.from);
  if (sParams.to) backParams.set("to", sParams.to);
  if (sParams.dept) backParams.set("dept", sParams.dept);
  if (sParams.severity) backParams.set("severity", sParams.severity);

  const backUrl = `/admin/dashboard/risks/list?${backParams.toString()}`;

  async function submitComment(formData: FormData) {
    "use server";
    const comment = formData.get("comment") as string;
    await prisma.riskmain.update({
      where: { riskid: Number(id) },
      data: {
        riskcommenthead: comment,
        riskstatus: "4",
      }
    });
    revalidatePath(backUrl);
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50/50 min-h-screen font-inter text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* ================= ซ้าย: ข้อมูลรายละเอียด ================= */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* 1. ข้อมูลทั่วไป */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  ข้อมูลทั่วไปผู้ประสบเหตุ
                </h2>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                  ID: {risk.riskid}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><User size={14}/> ชื่อ-สกุล</p>
                  <p className="text-sm font-semibold text-slate-900">{risk.riskname || "ไม่ระบุ"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><FileText size={14}/> HN</p>
                  <p className="text-sm font-semibold text-slate-900">{risk.riskhn || "-"}</p>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Calendar size={14}/> วัน-เวลาที่เกิดเหตุ</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    {risk.daterigter ? dayjs(risk.daterigter).format("DD/MM/YYYY") : '-'} 
                    <Clock size={14} className="text-slate-400 ml-1"/> 
                    {risk.timepicker ? dayjs(risk.timepicker).format("HH:mm") : '-'} น.
                  </p>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><MapPin size={14}/> สถานที่ / หน่วยงาน</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">จาก: {risk.depreport || "-"}</span>
                    <span className="text-slate-300">➔</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">ถึง: {risk.todep || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. รูปแบบความเสี่ยงและความรุนแรง (รวบ Card) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
               <h2 className="text-lg font-bold mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Activity className="text-indigo-600" size={20} />
                  ลักษณะเหตุการณ์และความรุนแรง
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* ด้านซ้าย: ประเภท */}
                 <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ประเภทความเสี่ยง</span>
                      <p className="text-indigo-600 font-bold text-base mt-1">{risk.risktype ?? "-"}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-200/60">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          รายละเอียด <DrugErrorTooltip label="ข้อมูลความคลาดเคลื่อนทางยา" description="PE: Perscribing Error, PDE: Pre-dispensing Error, DE: Dispensing Error, AE: Administrating Error" />
                        </span>
                        <p className="text-slate-800 font-medium text-sm mt-1">{risk.risktypedt ?? "-"}</p>
                      </div>
                    </div>

                    {(risk.risktypedrug || risk.risktypedrugdt) && (
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <span className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1.5 mb-2">
                          <BriefcaseMedical size={14} /> ข้อมูลความคลาดเคลื่อนทางยา
                        </span>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <span className="text-[11px] font-medium text-blue-500">ประเภท (Drug Error)</span>
                            <p className="text-slate-800 font-semibold text-sm">{risk.risktypedrug ?? "-"}</p>
                          </div>
                          <div>
                            <span className="text-[11px] font-medium text-blue-500">ประเภทย่อยทางยา</span>
                            <p className="text-slate-800 font-semibold text-sm">{risk.risktypedrugdt ?? "-"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                 </div>

                 {/* ด้านขวา: ความรุนแรง */}
                 <div>
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 h-full">
                      <span className="text-xs font-bold text-rose-600 uppercase flex items-center gap-1.5 mb-3">
                        <AlertCircle size={14} /> ระดับความรุนแรง (Severity)
                      </span>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-[11px] font-medium text-rose-500">ระดับความรุนแรงทางคลินิก/ยา</span>
                          <p className="font-bold text-rose-700 text-lg mt-0.5">
                            {[risk.risktypedrug, risk.risktypedrugdt, risk.clinicseverity].filter(Boolean).join(" / ") || "-"}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-rose-200/60">
                          <span className="text-[11px] font-medium text-rose-500">ระดับความรุนแรงทั่วไป</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{risk.genseverity ?? "-"}</p>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* 3. การบรรยายและวิเคราะห์ */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                <MessageSquare className="text-emerald-600" size={20} />
                การวิเคราะห์และการจัดการเบื้องต้น
              </h2>
              
              <div className="space-y-5">
                {/* สรุปเหตุการณ์ */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 mb-2">สรุปเหตุการณ์</h3>
                  <div className="bg-slate-50 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed" 
                       dangerouslySetInnerHTML={{ __html: risk.riskpresent || "-" }} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* การแก้ไขเบื้องต้น */}
                  <div>
                    <h3 className="text-xs font-semibold text-emerald-600 mb-2">การแก้ไขปัญหาเบื้องต้น</h3>
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed h-full">
                      {risk.riskfirstedit && risk.riskfirstedit.trim() !== "" && risk.riskfirstedit !== "<br>" 
                        ? <div dangerouslySetInnerHTML={{ __html: risk.riskfirstedit }} />
                        : <span className="text-slate-400 italic">ไม่มีข้อมูล</span>} 
                    </div>
                  </div>
                  
                  {/* วิเคราะห์สาเหตุ */}
                  <div>
                    <h3 className="text-xs font-semibold text-blue-600 mb-2">วิเคราะห์สาเหตุ (Root Cause)</h3>
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed h-full">
                      {risk.riskcauseanalysis && risk.riskcauseanalysis.trim() !== "" 
                        ? risk.riskcauseanalysis 
                        : <span className="text-slate-400 italic">ไม่มีข้อมูล</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. ความเห็นและการประเมิน */}
            <div className="space-y-4">
              {/* ความเห็นหัวหน้างาน */}
              <div className="bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-r-3xl p-5 shadow-sm">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center gap-2 mb-2">
                  <Stethoscope size={16} /> ความเห็นหัวหน้างาน / ผู้ตรวจสอบระดับแผนก
                </p>
                {risk.riskresultedit && risk.riskresultedit.replace(/<[^>]*>/g, '').trim() !== "" ? (
                  <div className="text-slate-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: risk.riskresultedit }} />
                ) : (
                  <p className="text-sm text-slate-400 italic">รอการบันทึกความเห็นจากหัวหน้างาน</p>
                )}
              </div>

              {/* ความเห็นผู้บริหาร */}
              <div className="bg-white border-l-4 border-l-emerald-500 border-y border-r border-slate-200 rounded-r-3xl p-5 shadow-sm">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} /> ข้อสั่งการ / ความเห็นผู้บริหาร
                </p>
                {risk.riskcommenthead && risk.riskcommenthead.replace(/<[^>]*>/g, '').trim() !== "" ? (
                  <div className="text-slate-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: risk.riskcommenthead }} />
                ) : (
                  <p className="text-sm text-slate-400 italic">ยังไม่มีข้อสั่งการจากผู้บริหาร</p>
                )}
              </div>

              {/* หมายเหตุ */}
              {risk.risknote && risk.risknote.replace(/<[^>]*>/g, '').trim() !== "" && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/60 mt-4">
                  <p className="text-xs font-bold text-amber-700 mb-1">หมายเหตุประกอบรายการ</p>
                  <div className="text-amber-900 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: risk.risknote }} />
                </div>
              )}
            </div>

          </div>

          {/* ================= ขวา: ส่วนตรวจสอบของผู้บริหาร (Sticky) ================= */}
          <div className="xl:col-span-1">
            <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white shadow-xl sticky top-8 border border-slate-800">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100 tracking-tight">Executive Action</h3>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">ส่วนการลงนามตรวจสอบ</p>
                </div>
              </div>

              <form action={submitComment} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    ความเห็น / สั่งการ (ข้อความที่จะบันทึก)
                  </label>
                  <textarea 
                    name="comment"
                    rows={8}
                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 resize-none"
                    placeholder="ระบุข้อความสั่งการ หรือข้อเสนอแนะ..."
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/50"
                >
                  <Send size={18} />
                  บันทึกการตรวจสอบ
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500 leading-relaxed">
                  บันทึกข้อมูลโดยอัตโนมัติภายใต้บัญชี: <br/>
                  <span className="text-slate-300 font-medium">{session?.user?.name || "Admin"}</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}