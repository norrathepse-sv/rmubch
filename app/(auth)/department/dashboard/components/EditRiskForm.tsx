"use client";

import { useSession } from "next-auth/react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/16/solid";
import {
  ClockIcon,
  MapPinIcon,
  Save,
  CheckCircle,
  Lock,
  MessageSquareReply,
  ShieldAlert,
  AlertTriangle,
  Info,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function EditRiskForm({ initialData, isSent, isInbox }: { initialData: any; disabled?: boolean; isSent?: boolean; isInbox?: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [currentRiskStatus] = useState(initialData.riskstatus);
  const [currentRiskresultedit] = useState(initialData.riskresultedit);

  const [formData, setFormData] = useState({
    ...initialData,
    riskresultedit: initialData.riskresultedit || "",
    riskheadreply: initialData.riskheadreply || "", 
    daterigter: initialData.daterigter ? dayjs(initialData.daterigter).format("YYYY-MM-DD") : "",
    timepicker: initialData.timepicker ? dayjs(initialData.timepicker).format("HH:mm") : "",
    todep: typeof initialData.todep === "string" ? initialData.todep.split(", ") : initialData.todep || [],
    risksubtype: initialData.risktypedt || "",
    clinicseverity: initialData.clinicseverity || "",
    genseverity: initialData.genseverity || "",
    risktype: initialData.risktype || "",
    risktypedt: initialData.risktypedt || "",
    // riskheadreply: initialData.riskheadreply || "",
  });
  console.log("Initial Form Data:", formData);

  useEffect(() => {
    fetch("/api/options")
      .then((res) => res.json())
      .then((data) => setOptions(data));
  }, []);

  const handleRiskTypeChange = (id: string, name: string) => {
    setFormData({ ...formData, risktypeId: id, risktype: name, risksubtype: "", risktypedt: "" });
  };

  const handleToDepChange = (value: string) => {
    const updated = formData.todep.includes(value)
      ? formData.todep.filter((i: string) => i !== value)
      : [...formData.todep, value];
    setFormData({ ...formData, todep: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        todep: Array.isArray(formData.todep) ? formData.todep.join(", ") : formData.todep,
        riskstatus: "2",
        riskdate_head: dayjs().toISOString(),
        risktypedt: formData.risksubtype,
        riskheadreply: formData.riskheadreply || "",
      };
      
      const res = await fetch(`/api/risks/${initialData.riskid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await Swal.fire({
          title: "บันทึกสำเร็จ!",
          text: "ระบบได้อัปเดตข้อมูลเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonColor: "#10b981",
          confirmButtonText: "กลับสู่หน้ารายการ",
        });
        router.push("/department/dashboard");
        router.refresh();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "ไม่สามารถบันทึกได้");
      }
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlock = async () => {
    const MASTER_PASSWORD = "rmubch@14201";
    const { value: password } = await Swal.fire({
      title: 'ยืนยันรหัสผ่านเพื่อปลดล็อก',
      text: 'กรุณากรอกรหัสผ่านสำหรับแก้ไขข้อมูลที่ถูกบันทึกไปแล้ว',
      input: 'password',
      inputPlaceholder: 'รหัสผ่าน',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    });

    if (password === MASTER_PASSWORD) {
      setIsUnlocked(true);
      setFormData((prev: any) => ({ ...prev, riskstatus: "1" }));
      Swal.fire({ icon: 'success', title: 'ปลดล็อกสำเร็จ', timer: 1500, showConfirmButton: false });
    } else if (password) {
      Swal.fire({ icon: 'error', title: 'รหัสผ่านไม่ถูกต้อง', text: 'ไม่สามารถปลดล็อกได้' });
    }
  };

  const hasExistingData = currentRiskresultedit && currentRiskresultedit.trim() !== "" && currentRiskresultedit !== "-" && currentRiskresultedit !== "[null]";
  const isLocked = hasExistingData && !isUnlocked;

  const filteredDepartments = options?.departments.filter(
    (d: any) => d.depname.toLowerCase().includes(searchTerm.toLowerCase()) && !formData.todep.includes(d.depname)
  );

  // Common styles
  const inputClass = "w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-slate-800 outline-none";
  const labelClass = "block text-[13px] font-bold text-slate-700 mb-1.5 ml-1";
  const cardClass = "bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6";

  return (
    <form onSubmit={handleSubmit} className="max-w-8xl mx-auto my-8 font-sans px-4">
      
      {/* Container หลัก แบ่งซ้ายขวาด้วย Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ===================== ฝั่งซ้าย (เนื้อหาฟอร์ม) ===================== */}
      <div className="lg:col-span-8 space-y-6">
          <fieldset disabled={isSent || isInbox} className={`space-y-6 ${isSent || isInbox ? 'opacity-95' : ''}`}>
            
            {/* Card 1: ข้อมูลทั่วไป */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">ข้อมูลทั่วไป</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>หน่วยงานที่รายงาน</label>
                  <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2 h-[50px]">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">{formData.depreport}</span>
                  </div>
                </div>

                <div className="relative">
                  <label className={labelClass}>หน่วยงานที่เกี่ยวข้อง (ส่งถึง)</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="ค้นหาหน่วยงาน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1">
                      {filteredDepartments?.map((d: any) => (
                        <button
                          key={d.depid} type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-slate-700 rounded-lg transition-colors"
                          onClick={() => { handleToDepChange(d.depname); setSearchTerm(""); }}
                        >
                          {d.depname}
                        </button>
                      ))}
                    </div>
                  )}
                  {formData.todep.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.todep.map((dept: string) => (
                        <span key={dept} className="bg-blue-50 text-blue-700 border border-blue-100 pl-3 pr-1 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                          {dept}
                          <button type="button" onClick={() => handleToDepChange(dept)} className="p-1 hover:bg-blue-200 rounded-full transition-colors">
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>ชื่อผู้ประสบปัญหา</label>
                  <input type="text" required className={inputClass} value={formData.riskname} onChange={(e) => setFormData({ ...formData, riskname: e.target.value })} />
                </div>

                <div>
                  <label className={labelClass}>HN คนไข้ (ถ้ามี)</label>
                  <input type="text" className={inputClass} value={formData.riskhn || ""} onChange={(e) => setFormData({ ...formData, riskhn: e.target.value })} />
                </div>

                <div>
                  <label className={labelClass}>วันที่เกิดเหตุ <span className="text-rose-500">*</span></label>
                  <input type="date" required className={inputClass} value={formData.daterigter} onChange={(e) => setFormData({ ...formData, daterigter: e.target.value })} />
                </div>

                <div>
                  <label className={labelClass}>เวลาที่เกิดเหตุ <span className="text-rose-500">*</span></label>
                  <TimePicker
                    format="HH:mm"
                    value={formData.timepicker ? dayjs(formData.timepicker, "HH:mm") : null}
                    className={`${inputClass} !flex`}
                    suffixIcon={<ClockIcon className="w-4 h-4 text-slate-400" />}
                    onChange={(time, timeString) => setFormData({ ...formData, timepicker: timeString as string })}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: การจัดหมวดหมู่และระดับความรุนแรง */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">หมวดหมู่และความรุนแรง</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={labelClass}>หมวดหมู่หลัก</label>
                  {isInbox ? (
                    <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 h-[50px] flex items-center">
                      {formData.risktype || "-"}
                    </div>
                  ) : (
                    <select required className={inputClass} value={formData.risktype} onChange={(e) => {
                      const opt = e.target.options[e.target.selectedIndex];
                      handleRiskTypeChange(opt.getAttribute("data-prefix") || "", e.target.value);
                    }}>
                      <option value="">-- เลือกหมวดหลัก --</option>
                      {(options?.riskGroups || []).map((g: any) => (
                        <option key={g.grid} data-prefix={g.grid} value={g.grname}>{g.grname}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className={labelClass}>รายละเอียดย่อย</label>
                  {isInbox ? (
                    <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 h-[50px] flex items-center truncate">
                      {formData.risktypedt || "-"}
                    </div>
                  ) : (
                    <select required className={inputClass} value={formData.risksubtype} onChange={(e) => setFormData({ ...formData, risksubtype: e.target.value, risktypedt: e.target.value })}>
                      <option value="">-- เลือกรายละเอียดย่อย --</option>
                      {(options?.riskGroups || []).find((g: any) => g.grid.toString() === formData.risktypeId?.toString() || g.grname === formData.risktype)
                        ?.riskgroupdt?.map((sub: any) => (
                          <option key={sub.dtgrid} value={sub.dtgrname}>{sub.dtgrname}</option>
                        ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clinic Severity Button */}
                <button type="button" onClick={() => setIsClinicModalOpen(true)} className="p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition-all text-left group">
                  <label className="block text-[11px] font-black text-rose-500 uppercase tracking-widest mb-1.5 cursor-pointer">ระดับความรุนแรง (Clinic)</label>
                  <div className="flex justify-between items-center">
                    {formData.clinicseverity ? (
                      <span className="text-slate-800 font-semibold text-sm">
                        <span className="font-black text-rose-600 mr-2">{options?.severityClinic?.find((s: any) => s.grlvname === formData.clinicseverity)?.grlvcode}</span>
                        {formData.clinicseverity}
                      </span>
                    ) : <span className="text-slate-400 text-sm font-medium">-- คลิกเพื่อเลือกระดับ --</span>}
                    <ChevronDownIcon className="w-5 h-5 text-rose-300 group-hover:text-rose-500 transition-colors" />
                  </div>
                </button>

                {/* General Severity Button */}
                <button type="button" onClick={() => setIsGenModalOpen(true)} className="p-4 rounded-2xl border-2 border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-all text-left group">
                  <label className="block text-[11px] font-black text-amber-500 uppercase tracking-widest mb-1.5 cursor-pointer">ระดับความรุนแรง (ทั่วไป)</label>
                  <div className="flex justify-between items-center">
                    {formData.genseverity ? (
                      <span className="text-slate-800 font-semibold text-sm">
                        <span className="font-black text-amber-600 mr-2">{options?.severityGen?.find((s: any) => s.grlvname === formData.genseverity)?.grlvcode}</span>
                        {formData.genseverity}
                      </span>
                    ) : <span className="text-slate-400 text-sm font-medium">-- คลิกเพื่อเลือกระดับ --</span>}
                    <ChevronDownIcon className="w-5 h-5 text-amber-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                </button>
              </div>
            </div>

            {/* Card 3: รายละเอียดเหตุการณ์ */}
            <div className={cardClass}>
              <div>
                <label className={labelClass}>บรรยายสรุปเหตุการณ์</label>
                <textarea required className={`${inputClass} min-h-[120px] resize-y`} value={formData.riskpresent} onChange={(e) => setFormData({ ...formData, riskpresent: e.target.value })} placeholder="อธิบายเหตุการณ์ที่เกิดขึ้นอย่างละเอียด..." />
              </div>
              <div>
                <label className={labelClass}>การแก้ไขเบื้องต้น</label>
                <textarea className={`${inputClass} min-h-[100px] resize-y`} value={formData.riskfirstedit || ""} onChange={(e) => setFormData({ ...formData, riskfirstedit: e.target.value })} placeholder="ระบุการจัดการหรือการแก้ไขปัญหาเบื้องต้น..." />
              </div>
            </div>

          </fieldset>
        </div>

        {/* ===================== ฝั่งขวา (ส่วนของหัวหน้างาน / Action) ===================== */}
        <div className="lg:col-span-4">
     <div className="sticky top-6">
            
            <div className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                isLocked || !isInbox ? "bg-slate-50 border-slate-200" : "bg-blue-50/50 border-blue-200 shadow-sm"
            }`}>
              <div className="flex flex-col gap-3 mb-6 border-b border-blue-100 pb-4">
                <label className={`flex items-center gap-2 text-base font-bold ${isLocked || isInbox ? "text-slate-600" : "text-blue-700"}`}>
                  <CheckCircle className="w-5 h-5" /> การจัดการโดยหัวหน้างาน
                </label>

                <div className="flex items-center gap-2 flex-wrap">
                  {!isInbox && isLocked && (
                    <button type="button" onClick={handleUnlock} className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors">
                      <Lock className="w-3.5 h-3.5" /> ปลดล็อกความเห็น
                    </button>
                  )}
                  {!isInbox && (!hasExistingData || isUnlocked) && (
                    <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-100 px-3 py-1.5 rounded-lg shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> พร้อมบันทึกข้อความ
                    </span>
                  )}
                  {isInbox && <span className="text-slate-500 font-bold text-[10px] uppercase bg-slate-200 px-2.5 py-1 rounded-md border border-slate-300">ความเห็น: Read Only</span>}
                </div>
              </div>

              <div className="space-y-5">
                {/* ช่องความเห็น: อิงตามสถานะ Lock/Inbox */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                    ความเห็นหัวหน้างาน
                  </label>
                  <textarea
                    value={formData.riskresultedit || ""}
                    onChange={(e) => setFormData({ ...formData, riskresultedit: e.target.value })}
                    disabled={isLocked || isInbox}
                    placeholder={isInbox ? "" : isLocked ? "รายการถูกบันทึกแล้ว (ปลดล็อกเพื่อแก้ไข)" : "ระบุความเห็นต่อเหตุการณ์ หรือวิเคราะห์สาเหตุ..."}
                    className={`w-full p-4 rounded-2xl min-h-[120px] text-sm transition-all resize-y outline-none ${
                      isLocked || isInbox ? "bg-slate-100/80 border border-slate-200 text-slate-500 cursor-not-allowed" : "bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800"
                    }`}
                  />
                </div>

                {/* ช่องตอบกลับ: เปิดให้พิมพ์ได้ตลอดเวลา (ไม่มี disabled) */}
              {(isInbox || isSent) && (
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                    <MessageSquareReply className="w-3.5 h-3.5" /> การดำเนินการแก้ไข / ตอบกลับ
                  </label>
                  <textarea
                    value={formData.riskheadreply || ""}
                    onChange={(e) => setFormData({ ...formData, riskheadreply: e.target.value })}
                    // ถ้าเป็น Outbound (isSent) ให้เป็น disabled
                    disabled={isSent} 
                    placeholder={isSent ? "รายการนี้ถูกส่งออกไปแล้ว" : "ระบุการแก้ไขเพื่อป้องกันการเกิดซ้ำ..."}
                    className={`w-full p-4 rounded-2xl min-h-[120px] text-sm transition-all resize-y outline-none border-2 ${
                      isSent 
                        ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" 
                        : "bg-white border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800"
                    }`}
                  />
                </div>
              )}
              </div>
            </div>

            {/* --- Executive Order (If exists) --- */}
            {formData.riskcommenthead && (
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 mb-1">ข้อสั่งการจากผู้บริหาร</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">{formData.riskcommenthead}</p>
                </div>
              </div>
            )}

            {/* --- Submit Actions (แนวตั้ง เพื่อให้เข้ากับคอลัมน์ขวา) --- */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? "bg-slate-300 cursor-not-allowed text-slate-500"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200"
                }`}
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? "กำลังบันทึก..." : "บันทึก / อัปเดตข้อมูล"}
              </button>
              
              <button 
                type="button" 
                onClick={() => router.back()} 
                className="w-full py-4 rounded-2xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> ยกเลิก / กลับ
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* --- Modals for Severity --- */}
      {/* Clinic Modal */}
      {isClinicModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-rose-100 flex justify-between items-center bg-rose-50/50">
              <h3 className="text-xl font-black text-rose-900">ระดับความรุนแรง (Clinic)</h3>
              <button type="button" onClick={() => setIsClinicModalOpen(false)} className="p-2 hover:bg-rose-100 rounded-full text-rose-700 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
              {options?.severityClinic?.slice().sort((a: any, b: any) => a.grlvcode.localeCompare(b.grlvcode)).map((s: any) => {
                const isHighSeverity = s.grlvcode >= "E" && s.grlvcode !== "z";
                const isSelected = formData.clinicseverity === s.grlvname;
                return (
                  <button key={s.grlvid} type="button" onClick={() => { setFormData({ ...formData, clinicseverity: s.grlvname }); setIsClinicModalOpen(false); }}
                    className={`p-5 text-left rounded-2xl border-2 transition-all ${
                      isSelected ? isHighSeverity ? "bg-red-50 border-red-500 ring-1 ring-red-500" : "bg-rose-50 border-rose-500 ring-1 ring-rose-500"
                      : "bg-white border-slate-100 hover:border-rose-200 hover:bg-rose-50/30"
                    }`}
                  >
                    <div className="flex gap-4">
                      <span className={`font-black text-xl ${isSelected ? (isHighSeverity ? "text-red-700" : "text-rose-700") : (isHighSeverity ? "text-red-500" : "text-slate-400")}`}>{s.grlvcode}</span>
                      <p className={`text-sm mt-0.5 leading-relaxed ${isSelected ? "text-slate-900 font-bold" : "text-slate-600 font-medium"}`}>{s.grlvname}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* General Modal */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-amber-100 flex justify-between items-center bg-amber-50/50">
              <h3 className="text-xl font-black text-amber-900">ระดับความรุนแรง (ทั่วไป)</h3>
              <button type="button" onClick={() => setIsGenModalOpen(false)} className="p-2 hover:bg-amber-100 rounded-full text-amber-700 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
              {options?.severityGen?.slice().sort((a: any, b: any) => Number(a.grlvcode) - Number(b.grlvcode)).map((s: any) => {
                const isSelected = formData.genseverity === s.grlvname;
                const isHighSeverity = Number(s.grlvcode) > 4 && Number(s.grlvcode) !== 10;
                return (
                  <button key={s.grlvid} type="button" onClick={() => { setFormData({ ...formData, genseverity: s.grlvname }); setIsGenModalOpen(false); }}
                    className={`p-5 text-left rounded-2xl border-2 transition-all ${
                      isSelected ? isHighSeverity ? "bg-red-50 border-red-500 ring-1 ring-red-500" : "bg-amber-50 border-amber-500 ring-1 ring-amber-500"
                      : "bg-white border-slate-100 hover:border-amber-200 hover:bg-amber-50/30"
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <span className={`px-2.5 py-1 rounded-lg font-black text-lg ${isSelected ? (isHighSeverity ? "bg-red-600 text-white" : "bg-amber-500 text-white") : (isHighSeverity ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600")}`}>{s.grlvcode}</span>
                      <p className={`text-sm mt-1 leading-relaxed ${isSelected ? "text-slate-900 font-bold" : "text-slate-600 font-medium"}`}>{s.grlvname}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}