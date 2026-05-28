"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import {
  Save, Building2, Image as ImageIcon, ShieldCheck,
  Download, Info, Clock, User, FileText, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { saveHospitalConfig, exportDatabase } from "../actions/systemActions";

// --- Types & Config ---
interface AuditLog {
  id: number;
  userName: string | null;
  action: string;
  target: string | null;
  detail: string | null;
  createdAt: Date;
}

interface Props {
  hospitalName: string; hospitalSubname: string; logoUrl: string;
  auditLogs: AuditLog[]; auditTotal: number; appVersion: string;
  dbVersion: string; totalRisks: number; totalUsers: number;
}

const ACTION_COLOR: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-slate-100 text-slate-600",
  EXPORT: "bg-amber-100 text-amber-700",
};

export default function SystemTab({
  hospitalName: iName, hospitalSubname: iSub, logoUrl: iLogo,
  auditLogs, auditTotal, appVersion, dbVersion, totalRisks, totalUsers,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [name, setName] = useState(iName);
  const [sub, setSub] = useState(iSub);
  const [logo, setLogo] = useState(iLogo);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // --- Pagination State for Audit Log ---
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const totalPages = Math.ceil(auditLogs.length / logsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    return auditLogs.slice(start, start + logsPerPage);
  }, [auditLogs, currentPage]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSaveHospital() {
    startTransition(async () => {
      await saveHospitalConfig({ hospitalName: name, hospitalSubname: sub, logoUrl: logo });
      showToast("บันทึกข้อมูลโรงพยาบาลสำเร็จ");
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await exportDatabase();
      if (res.url) {
        const a = document.createElement("a");
        a.href = res.url;
        a.download = res.filename ?? `backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast("Export สำเร็จ");
      }
    } catch (err) {
      showToast("เกิดข้อผิดพลาดในการ Export");
    } finally {
      setExporting(false);
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast("ขนาดไฟล์ต้องไม่เกิน 2MB");

    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-8 pb-10">
      {toast && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl z-[60] animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      {/* ── 1. ข้อมูลโรงพยาบาล ── */}
      <Section icon={<Building2 size={16} />} title="ข้อมูลโรงพยาบาล" subtitle="Hospital Info & Branding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ชื่อโรงพยาบาล</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น โรงพยาบาลมะเร็งอุบลราชธานี"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ชื่อย่อ / ระบบ (Sub-name)</label>
                <input
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                  placeholder="เช่น RMUBCH"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                />
              </div>
            </div>
            <button
              onClick={handleSaveHospital}
              disabled={isPending}
              className="flex items-center justify-center gap-2 h-11 px-8 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
            >
              {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">โลโก้หน่วยงาน</label>
            <div className="relative group">
              <div
                onClick={() => fileRef.current?.click()}
                className={`w-full h-40 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                  logo ? 'border-slate-200 bg-white' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {logo ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img src={logo} alt="logo" className="h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-[10px] font-bold">คลิกเพื่อเปลี่ยนรูป</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={28} className="text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                    <p className="text-xs text-slate-400 font-medium">อัปโหลดโลโก้</p>
                    <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-tighter">PNG, JPG (Max 2MB)</p>
                  </>
                )}
              </div>
              {logo && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLogo(""); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
        </div>
      </Section>

      {/* ── 2. Audit Log ── */}
      <Section icon={<ShieldCheck size={16} />} title="Audit Log" subtitle={`ประวัติการใช้งานระบบล่าสุด (${auditTotal.toLocaleString()} รายการ)`}>
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 pb-1">
            <p className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">เวลา</p>
            <p className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">ผู้ใช้</p>
            <p className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">การกระทำ</p>
            <p className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</p>
            <p className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">รายละเอียด</p>
          </div>

          <div className="space-y-2">
            {paginatedLogs.map((log) => (
              <div key={log.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white rounded-2xl px-4 py-3 border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all">
                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-slate-700">{new Date(log.createdAt).toLocaleDateString("th-TH")}</p>
                  <p className="text-[10px] font-medium text-slate-400">{new Date(log.createdAt).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })} น.</p>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><User size={12} /></div>
                  <span className="text-xs text-slate-600 font-bold truncate">{log.userName || "System"}</span>
                </div>
                <div className="col-span-2">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg inline-block uppercase tracking-wider ${ACTION_COLOR[log.action] || "bg-slate-100 text-slate-500"}`}>
                    {log.action}
                  </span>
                </div>
                <div className="col-span-3 text-xs text-slate-500 font-medium truncate">{log.target || "—"}</div>
                <div className="col-span-3 text-[11px] text-slate-400 italic truncate">{log.detail || "—"}</div>
              </div>
            ))}
          </div>

          {/* Pagination for Logs */}
          <div className="flex items-center justify-between px-2 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 transition-all"
              ><ChevronLeft size={14} /></button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 transition-all"
              ><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 3. ข้อมูลระบบ ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Section icon={<Info size={16} />} title="ข้อมูลทางเทคนิค" subtitle="Software & Database Status">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "App Version", value: appVersion, icon: <FileText size={14} />, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Database", value: dbVersion, icon: <ImageIcon size={14} />, color: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Incidents", value: totalRisks.toLocaleString(), icon: <ShieldCheck size={14} />, color: "text-rose-500", bg: "bg-rose-50" },
                { label: "Total Users", value: totalUsers.toLocaleString(), icon: <User size={14} />, color: "text-amber-500", bg: "bg-amber-50" },
                { label: "Node Env", value: process.env.NODE_ENV || "production", icon: <Info size={14} />, color: "text-slate-500", bg: "bg-slate-100" },
                { label: "System Date", value: new Date().toLocaleDateString("th-TH"), icon: <Clock size={14} />, color: "text-purple-500", bg: "bg-purple-50" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-blue-200 transition-all group">
                  <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5 font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── 4. Backup ── */}
        <Section icon={<Download size={16} />} title="การสำรองข้อมูล" subtitle="Safety & Recovery">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wide">Manual Export</p>
              <div className="grid gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center justify-between w-full h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 disabled:opacity-50 transition-all"
                >
                  <span className="flex items-center gap-2">
                    {exporting ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={13} />}
                    Export JSON
                  </span>
                  <span className="text-[10px] opacity-50 font-mono">.json</span>
                </button>
                <a
                  href="/api/admin/export-csv"
                  className="flex items-center justify-between w-full h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  <span className="flex items-center gap-2"><Download size={13} /> Export CSV</span>
                  <span className="text-[10px] text-slate-400 font-mono">.csv</span>
                </a>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <Info size={14} />
                <p className="text-[11px] font-black uppercase">ข้อควรระวัง</p>
              </div>
              <ul className="text-[10px] text-amber-700/80 space-y-1.5 font-medium leading-relaxed">
                <li className="flex gap-2"><span>•</span> ควรสำรองข้อมูลความเสี่ยงอย่างน้อยสัปดาห์ละ 1 ครั้ง</li>
                <li className="flex gap-2"><span>•</span> ข้อมูล Export นี้ไม่รวมรูปภาพประกอบในเคส</li>
                <li className="flex gap-2"><span>•</span> การกู้คืนข้อมูล (Restore) ต้องทำโดยผู้ดูแลระบบเท่านั้น</li>
              </ul>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

// --- Sub Component ---
function Section({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">{icon}</div>
        <div>
          <h3 className="text-base font-black text-slate-800 leading-none">{title}</h3>
          <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}