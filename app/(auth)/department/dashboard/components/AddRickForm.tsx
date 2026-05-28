"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { ClockIcon, MapPinIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import Swal from "sweetalert2";
import AIRiskAnalysis from "./AIRiskAnalysis";

export default function AddRiskForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ล็อคปุ่มทันทีที่ระดับ Memory (ไวกว่า State)
  const submitLock = useRef(false);

  const [formData, setFormData] = useState({
    riskname: "",
    riskhn: "",
    riskage: "",
    daterigter: dayjs().format('YYYY-MM-DD'),
    timepicker: "",
    depreport: "", 
    todep: [] as string[], 
    risktype: "",     // ชื่อหมวดหลัก
    risktypeId: "",   // ID หมวดหลัก (drid หรือ grid)
    risksubtype: "",  // รายละเอียดย่อย (จากตาราง riskgroupdt)
    risktypedt: "",  // รายละเอียดเพิ่มเติม (กรณีประเภท 13)
    risktypedrug: "",
    risktypedrugresult: "",
    clinicseverity: "",
    genseverity: "",
    riskpresent: "",
    riskfirstedit: "",
  });

  const [showDetail, setShowDetail] = useState(false);
  const [showDrugSection, setShowDrugSection] = useState(false);

  // ดึงข้อมูล Options
  useEffect(() => {
    fetch("/api/options")
      .then(res => res.json())
      .then(data => setOptions(data));
  }, []);

  // ดึงข้อมูล Session แยกออกมาเพื่อไม่ให้ fetch ซ้ำซ้อน
  useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      setFormData(prev => ({ ...prev, depreport: session.user.name as string }));
    }
  }, [session, status]);

  // เปลี่ยนหมวดหลัก พร้อมล้างค่าขยะ
  const handleRiskTypeChange = (id: string, name: string) => {
    setFormData(prev => ({ 
      ...prev, 
      risktypeId: id, 
      risktype: name,
      risksubtype: "",
      risktypedt: "",
      risktypedrug: "",
      risktypedrugresult: ""
    }));
    setShowDetail(id === "13");
    setShowDrugSection(id === "2" || id === "12");
  };

  const handleToDepChange = (value: string) => {
    const updated = formData.todep.includes(value)
      ? formData.todep.filter(i => i !== value)
      : [...formData.todep, value];
    setFormData({ ...formData, todep: updated });
  };

  const handleAISelect = (type: "clinic" | "gen", code: string) => {
    if (type === "clinic") {
      const selected = (options?.severityClinic || []).find(
        (s: any) => s.grlvcode.toUpperCase() === code.toUpperCase()
      );
      if (selected) setFormData(prev => ({ ...prev, clinicseverity: selected.grlvname }));
    } else {
      const selected = (options?.severityGen || []).find(
        (s: any) => Number(s.grlvcode) === Number(code)
      );
      if (selected) setFormData(prev => ({ ...prev, genseverity: selected.grlvname }));
    }
  };

  // เช็คข้อมูลซ้ำ
  const checkDuplicate = async () => {
    try {
      const cleanName = formData.riskname.replace(/\s+/g, '');
      const query = new URLSearchParams({
        name: cleanName,
        date: formData.daterigter,
        time: formData.timepicker
      }).toString();

      const res = await fetch(`/api/risks/check-duplicate?${query}`);
      const data = await res.json();
      return data.isDuplicate;
    } catch (error) {
      return false;
    }
  };
  
  const handleReset = () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมด?")) return;

    setFormData((prev) => ({
      riskname: "",
      riskhn: "",
      riskage: "",
      daterigter: dayjs().format('YYYY-MM-DD'),
      timepicker: "",
      depreport: prev.depreport, 
      todep: [], 
      risktype: "",
      risktypeId: "",
      risksubtype: "",
      risktypedt: "",
      risktypedrug: "",
      risktypedrugresult: "",
      clinicseverity: "",
      genseverity: "",
      riskpresent: "",
      riskfirstedit: "",
    }));

    setShowDetail(false);
    setShowDrugSection(false);
    setSearchTerm("");
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (submitLock.current) return;


  const extractTimeOnly = (timeStr: string) => {
      if (!timeStr) return "";
      // ค้นหาแพทเทิร์นเวลา 00:00 ถึง 23:59 ในข้อความ
      const match = timeStr.match(/([01]\d|2[0-3]):([0-5]\d)/);
      return match ? match[0] : timeStr;
    };

  // Validation
  if (formData.todep.length === 0)
    return Swal.fire("แจ้งเตือน", "กรุณาระบุหน่วยงานที่เกี่ยวข้องอย่างน้อย 1 หน่วยงาน", "warning");
  if (!formData.timepicker)
    return Swal.fire("แจ้งเตือน", "กรุณาระบุเวลา", "warning");
  if (!formData.clinicseverity && !formData.genseverity)
    return Swal.fire("แจ้งเตือน", "กรุณาระบุระดับความรุนแรง (Clinic หรือ General)", "warning");

  submitLock.current = true;
  setIsSubmitting(true);

  try {
    const isDuplicate = await checkDuplicate();
    if (isDuplicate) {
      submitLock.current = false;
      setIsSubmitting(false);
      const result = await Swal.fire({
        title: "พบข้อมูลที่อาจซ้ำซ้อน!",
        html: `มีเคสของ <b>${formData.riskname}</b> ในเวลานี้อยู่แล้ว<br/>ยืนยันการบันทึกซ้ำหรือไม่?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ยืนยัน บันทึกซ้ำ",
        cancelButtonText: "ยกเลิก",
      });
      if (!result.isConfirmed) return;
      
      // ถ้ากดยืนยัน ให้ล็อกกลับมา
      submitLock.current = true;
      setIsSubmitting(true);
    }

    // ---------------------------------------------------------
    // 1. จัดการระดับความรุนแรง (ดึง Code มารวมกับ Name เป็น A:รายละเอียด)
    // ---------------------------------------------------------
    const currentClinicCode = options?.severityClinic?.find(
      (s: any) => s.grlvname === formData.clinicseverity
    )?.grlvcode || "";

    const currentGenCode = options?.severityGen?.find(
      (s: any) => s.grlvname === formData.genseverity
    )?.grlvcode || "";

    const formatSeverity = (code: string, name: string) => {
      if (!name) return ""; // ถ้าไม่ได้เลือกอะไรเลย
      // ถ้าข้อมูลมี : อยู่แล้ว แสดงว่าถูกจัดรูปแบบมาแล้ว ไม่ต้องทำซ้ำ
      if (name.includes(":")) return name;
      // ถ้ายัังไม่มี ให้รวมเป็น Code:Name
      return code ? `${code}:${name}` : name;
    };

    const finalClinicSeverity = formatSeverity(currentClinicCode, formData.clinicseverity);
    const finalGenSeverity = formatSeverity(currentGenCode, formData.genseverity);

    // ---------------------------------------------------------
    // 2. ส่งข้อมูลเข้า API
    // ---------------------------------------------------------
    const res = await fetch("/api/risks", {
      method: "POST", // หรือ PUT ถ้าเป็นหน้า Edit
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        // เอาความรุนแรงที่จัดรูปแบบแล้วไปแทนที่
        clinicseverity: finalClinicSeverity,
        genseverity: finalGenSeverity,
        
        // ถ้าฐานข้อมูลเก็บ todep เป็น String ให้แปลงจาก Array ด้วย (ถ้าเก็บเป็น Array อยู่แล้ว เอาบรรทัดนี้ออกได้เลยครับ)
        todep: Array.isArray(formData.todep) ? formData.todep.join(", ") : formData.todep,
        risktypedt: formData.risksubtype,
        // Format วันที่ให้แน่ใจว่าเป็น YYYY-MM-DD
        daterigter: dayjs(formData.daterigter).format("YYYY-MM-DD"),

        timepicker: extractTimeOnly(formData.timepicker),
      }),
    });

    if (res.ok) {
      Swal.fire("สำเร็จ!", "บันทึกเรียบร้อย", "success").then(() => {
        router.push("/department/dashboard");
      });
    } else {
      // จับ Error กรณีที่ API ส่งสถานะที่ไม่ใช่ 200 กลับมา
      throw new Error("API responded with an error"); 
    }
  } catch (err) {
    console.error("Submit Error:", err);
    Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
  } finally {
    submitLock.current = false;
    setIsSubmitting(false);
  }
};

  const filteredDepartments = (options?.departments || []).filter((d: any) =>
    d.depname?.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !formData.todep.includes(d.depname)
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 md:p-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-900/5 rounded-[2rem] space-y-10 my-10 border border-slate-100">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">รายงานอุบัติการณ์ความเสี่ยง</h1>
        <p className="text-slate-500 font-medium">กรุณากรอกข้อมูลให้ครบถ้วน</p>
      </div>

      {/* ส่วนที่ 1: ข้อมูลทั่วไป */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
          ข้อมูลทั่วไป
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">หน่วยงานที่รายงาน</label>
            <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
              <MapPinIcon className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-semibold text-slate-700">{formData.depreport || 'กำลังดึงข้อมูล...'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">หน่วยงานที่เกี่ยวข้อง <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
                placeholder="ค้นหาหน่วยงาน..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto p-2 py-2">
                  {filteredDepartments.map((d: any) => (
                    <button 
                      key={d.depid} 
                      type="button" 
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium text-slate-600" 
                      onClick={() => { handleToDepChange(d.depname); setSearchTerm(""); }}
                    >
                      {d.depname}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* แสดง Tag หน่วยงานที่ถูกเลือกแล้ว */}
            {formData.todep.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in">
                {formData.todep.map((dep, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-100 shadow-sm"
                  >
                    {dep}
                    <button
                      type="button"
                      onClick={() => handleToDepChange(dep)}
                      className="p-0.5 hover:bg-blue-200 rounded-full transition-colors text-blue-500 hover:text-blue-800"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">ชื่อผู้ประสบปัญหา <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
              placeholder="ระบุชื่อ-นามสกุล"
              value={formData.riskname} 
              onChange={(e) => setFormData({...formData, riskname: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">HN (ถ้ามี)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
              placeholder="ระบุรหัสประจำตัวผู้ป่วย"
              value={formData.riskhn} 
              onChange={(e) => setFormData({...formData, riskhn: e.target.value})} 
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">วันที่เกิดเหตุ <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                value={formData.daterigter} 
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
                onChange={(e) => setFormData({...formData, daterigter: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">เวลาที่เกิดเหตุ <span className="text-red-500">*</span></label>
              <TimePicker 
                format="HH:mm" 
                className="w-full h-[50px] rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all" 
                value={formData.timepicker ? dayjs(formData.timepicker, 'HH:mm') : null} 
                onChange={(_, s) => setFormData({...formData, timepicker: s as string})} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนที่ 2: ประเภทความเสี่ยง */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
          ประเภทความเสี่ยง
        </h2>
        
        <div className="p-6 md:p-8 border border-blue-100 bg-blue-50/30 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-blue-900">หมวดหมู่หลัก <span className="text-red-500">*</span></label>
              <select 
                required 
                className="w-full px-4 py-3.5 rounded-xl border border-blue-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
                value={formData.risktype}
                onChange={(e) => {
                  const opt = e.target.options[e.target.selectedIndex];
                  handleRiskTypeChange(opt.getAttribute("data-prefix") || "", e.target.value);
                }}
              >
                <option value="">-- เลือกหมวดหลัก --</option>
                {(options?.riskGroups || []).map((g: any) => (
                  <option key={g.grid} data-prefix={g.grid} value={g.grname}>{g.grname}</option>
                ))}
              </select>
            </div>

            {formData.risktypeId && (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="block text-sm font-bold text-blue-900">รายละเอียดย่อย <span className="text-red-500">*</span></label>
                <select 
                  required 
                  className="w-full px-4 py-3.5 rounded-xl border border-blue-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
                  value={formData.risksubtype}
                  onChange={(e) => setFormData({...formData, risksubtype: e.target.value})}
                >
                  <option value="">-- เลือกรายละเอียดย่อย --</option>
                  {(options?.riskGroups || [])
                    .find((g: any) => g.grid.toString() === formData.risktypeId.toString())
                    ?.riskgroupdt?.map((sub: any) => (
                      <option key={sub.dtgrid} value={sub.dtgrname}>{sub.dtgrname}</option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* เงื่อนไขพิเศษ 13 และ ยา */}
          {showDetail && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 transition-all placeholder:text-yellow-700/50 min-h-[100px]" 
                placeholder="รายละเอียดเพิ่มเติมประเภท 13..." 
                value={formData.risktypedt}
                onChange={(e) => setFormData({...formData, risktypedt: e.target.value})} 
              />
            </div>
          )}
          {showDrugSection && (
            <div className="bg-white p-6 rounded-2xl space-y-4 border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-2">
                💊 ข้อมูลความคลาดเคลื่อนทางยา
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" 
                  value={formData.risktypedrug}
                  onChange={(e) => setFormData({...formData, risktypedrug: e.target.value})}
                >
                  <option value="">-- เลือกประเภท --</option>
                  <option value="PE">PE (Prescribing Error)</option>
                  <option value="PDE">PDE (Pre-dispensing Error)</option>
                  <option value="DE">DE (Dispensing Error)</option>
                  <option value="AE">AE (Administration Error)</option>
                </select>
                <textarea 
                  placeholder="รายการยาที่เกิดปัญหา..." 
                  value={formData.risktypedrugresult}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all min-h-[50px]" 
                  onChange={(e) => setFormData({...formData, risktypedrugresult: e.target.value})} 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ส่วนที่ 3: ระดับความรุนแรง */}
<div className="space-y-6">
  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
    ระดับความรุนแรง
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* ปุ่ม Clinic Severity */}
    <button 
      type="button" 
      onClick={() => setIsClinicModalOpen(true)} 
      className="group relative overflow-hidden p-6 bg-white hover:bg-rose-50/50 rounded-3xl border border-rose-200 text-left transition-all shadow-sm hover:shadow-md hover:border-rose-300"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
      <span className="relative block text-xs tracking-wider text-rose-500 font-bold uppercase mb-2">Clinic Severity</span>
      
      <span className="relative block text-lg font-black text-slate-800 group-hover:text-rose-700 transition-colors">
        {formData.clinicseverity ? (
          <span className="flex items-center gap-3">
            <span className="flex-shrink-0 flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-xl bg-rose-100 text-rose-700 font-black text-base shadow-sm">
              {options?.severityClinic?.find((s: any) => s.grlvname === formData.clinicseverity)?.grlvcode || "-"}
            </span>
            <span className="truncate">{formData.clinicseverity}</span>
          </span>
        ) : (
          "คลิกเพื่อเลือกระดับความรุนแรง (Clinic) →"
        )}
      </span>
    </button>

    {/* ปุ่ม General Severity */}
    <button 
      type="button" 
      onClick={() => setIsGenModalOpen(true)} 
      className="group relative overflow-hidden p-6 bg-white hover:bg-amber-50/50 rounded-3xl border border-amber-200 text-left transition-all shadow-sm hover:shadow-md hover:border-amber-300"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
      <span className="relative block text-xs tracking-wider text-amber-500 font-bold uppercase mb-2">General Severity</span>
      
      <span className="relative block text-lg font-black text-slate-800 group-hover:text-amber-700 transition-colors">
        {formData.genseverity ? (
          <span className="flex items-center gap-3">
            <span className="flex-shrink-0 flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-xl bg-amber-100 text-amber-700 font-black text-base shadow-sm">
              {options?.severityGen?.find((s: any) => s.grlvname === formData.genseverity)?.grlvcode || "-"}
            </span>
            <span className="truncate">{formData.genseverity}</span>
          </span>
        ) : (
          "คลิกเพื่อเลือกระดับความรุนแรง (General) →"
        )}
      </span>
    </button>
  </div>
</div>
     

      {/* ส่วนที่ 4: บรรยายเหตุการณ์ */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
          รายละเอียดเหตุการณ์
        </h2>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">บรรยายสรุปเหตุการณ์ <span className="text-red-500">*</span></label>
            <textarea 
              required 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm min-h-[140px] leading-relaxed" 
              placeholder="อธิบายลำดับเหตุการณ์ที่เกิดขึ้นอย่างชัดเจน..."
              value={formData.riskpresent} 
              onChange={(e) => setFormData({...formData, riskpresent: e.target.value})} 
            />
          </div>
          
          <AIRiskAnalysis text={formData.riskpresent} options={options} onSelect={handleAISelect} />
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">การแก้ไขเบื้องต้น</label>
            <textarea 
              className="w-full px-5 py-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm min-h-[100px] leading-relaxed" 
              placeholder="ระบุการจัดการหรือการแก้ไขปัญหาเบื้องต้น..." 
              value={formData.riskfirstedit}
              onChange={(e) => setFormData({...formData, riskfirstedit: e.target.value})} 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-slate-100">
        <button 
          type="button" 
          onClick={handleReset} 
          className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-colors"
        >
          ล้างค่า
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className={`flex-1 py-4 rounded-2xl font-bold text-white text-lg shadow-xl transition-all ${
            isSubmitting 
              ? 'bg-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-600/25 active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? "กำลังบันทึกข้อมูล..." : "บันทึกรายงานอุบัติการณ์"}
        </button>
      </div>

      {/* Modal สำหรับ Clinic Severity */}
      {isClinicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-[2rem] overflow-hidden border-0 outline-none">
            <div className="p-6 border-b flex justify-between items-center bg-rose-50/50">
              <div>
                <h3 className="text-xl font-black text-rose-900">ระดับความรุนแรง (Clinic)</h3>
                <p className="text-rose-600/70 text-sm mt-1">เลือกระดับผลกระทบทางคลินิกที่เกิดขึ้น</p>
              </div>
              <button type="button" onClick={() => setIsClinicModalOpen(false)} className="p-2 hover:bg-rose-100 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6 text-rose-900" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
              {options?.severityClinic
                ?.slice()
                .sort((a: any, b: any) => a.grlvcode.localeCompare(b.grlvcode))
                .map((s: any) => {
                  const isHighSeverity = s.grlvcode >= 'E' && s.grlvcode !== 'z'; 
                  const isSelected = formData.clinicseverity === s.grlvname;

                  return (
                    <button
                      key={s.grlvid}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, clinicseverity: s.grlvname });
                        setIsClinicModalOpen(false);
                      }}
                      className={`group p-5 text-left rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                        isSelected 
                          ? isHighSeverity 
                            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                            : 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20' 
                          : isHighSeverity
                            ? 'bg-white border-red-100 hover:border-red-400 text-red-700 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-rose-300 text-slate-700 shadow-sm' 
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`px-3 py-1 rounded-xl font-black text-lg shrink-0 ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : isHighSeverity ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                        }`}>
                          {s.grlvcode}
                        </div>
                        <p className={`text-[15px] leading-relaxed font-semibold mt-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                          {s.grlvname}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: General Severity */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
         <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-[2rem] overflow-hidden border-0 outline-none">
            <div className="p-6 border-b border-amber-100 flex justify-between items-center bg-amber-50/50">
              <div>
                <h3 className="text-xl font-black text-amber-900">ระดับความรุนแรง (ทั่วไป)</h3>
                <p className="text-amber-700/70 text-sm mt-1">กรุณาเลือกระดับที่ตรงกับอุบัติการณ์ที่เกิดขึ้น</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsGenModalOpen(false)} 
                className="p-2 hover:bg-amber-100 text-amber-900 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options?.severityGen
                  ?.slice()
                  .sort((a: any, b: any) => Number(a.grlvcode) - Number(b.grlvcode)) 
                  .map((s: any) => {
                    const isSelected = formData.genseverity === s.grlvname;
                    const codeNumber = Number(s.grlvcode);
                    const isHighSeverity = Number(s.grlvcode) > 4 && codeNumber !== 10;

                    return (
                      <button
                        key={s.grlvid}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, genseverity: s.grlvname });
                          setIsGenModalOpen(false);
                        }}
                        className={`group p-5 text-left rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                          isSelected 
                            ? isHighSeverity
                              ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                              : 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' 
                            : isHighSeverity
                              ? 'bg-white border-red-100 hover:border-red-400 text-red-700 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-amber-400 text-slate-700 shadow-sm' 
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`px-3 py-1 rounded-xl font-black text-lg shrink-0 ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : isHighSeverity ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {s.grlvcode}
                          </div>
                          <div className="flex-1 mt-1">
                            <p className={`text-[15px] leading-relaxed font-semibold ${
                              isSelected ? 'text-white' : 'text-slate-700'
                            }`}>
                              {s.grlvname}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}