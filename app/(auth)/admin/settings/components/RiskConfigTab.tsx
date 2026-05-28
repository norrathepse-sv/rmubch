"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Save, Clock, ShieldAlert, FolderTree, List } from "lucide-react";
import { saveRiskGroups, saveRiskGroupDt, saveRiskGroupLv, saveSlaConfig } from "../actions/riskConfigActions";

interface RiskGroup   { grid: number; grname: string | null; dtgrid: number | null }
interface RiskGroupDt { dtgrid: number; dtgrname: string | null; drid: number | null }
interface RiskGroupLv { grlvid: number; grlvcode: string | null; grlvname: string | null; grlvlevel: string | null }

interface Props {
  riskGroups:   RiskGroup[];
  riskGroupDts: RiskGroupDt[];
  riskGroupLvs: RiskGroupLv[];
  slaDays:      number;
  nearMissCode: string;
}

export default function RiskConfigTab({ riskGroups: ig, riskGroupDts: idt, riskGroupLvs: ilv, slaDays: iSla, nearMissCode: iNm }: Props) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast]   = useState<string | null>(null);
  const [groups, setGroups] = useState(ig);
  const [dts, setDts]       = useState(idt);
  const [lvs, setLvs]       = useState(ilv);
  const [slaDays, setSlaDays]         = useState(iSla);
  const [nearMissCode, setNearMissCode] = useState(iNm);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  // ── riskgroup handlers ──
  function updateGroup(i: number, grname: string) {
    setGroups((p) => p.map((g, idx) => idx === i ? { ...g, grname } : g));
  }
  function addGroup() {
    setGroups((p) => [...p, { grid: Date.now(), grname: "", dtgrid: null }]);
  }
  function removeGroup(i: number) { setGroups((p) => p.filter((_, idx) => idx !== i)); }

  // ── riskgroupdt handlers ──
  function updateDt(i: number, field: "dtgrname" | "drid", value: any) {
    setDts((p) => p.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  }
  function addDt() {
    setDts((p) => [...p, { dtgrid: Date.now(), dtgrname: "", drid: groups[0]?.grid ?? null }]);
  }
  function removeDt(i: number) { setDts((p) => p.filter((_, idx) => idx !== i)); }

  // ── riskgrouplv handlers ──
  function updateLv(i: number, field: keyof RiskGroupLv, value: string) {
    setLvs((p) => p.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }
  function addLv() {
    setLvs((p) => [...p, { grlvid: Date.now(), grlvcode: "", grlvname: "", grlvlevel: "" }]);
  }
  function removeLv(i: number) { setLvs((p) => p.filter((_, idx) => idx !== i)); }

  async function handleSave() {
    startTransition(async () => {
      await Promise.all([
        saveRiskGroups(groups),
        saveRiskGroupDt(dts),
        saveRiskGroupLv(lvs),
        saveSlaConfig({ slaDays, nearMissCode }),
      ]);
      showToast("บันทึกการตั้งค่าสำเร็จ");
    });
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* ── Section 1: riskgroup ── */}
      <Section icon={<FolderTree size={16} />} title="กลุ่มความเสี่ยง" subtitle="riskgroup">
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-3 px-4 pb-1">
            <p className="col-span-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</p>
            <p className="col-span-9 text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อกลุ่ม (grname)</p>
            <p className="col-span-2" />
          </div>
          {groups.map((g, i) => (
            <div key={g.grid} className="grid grid-cols-12 gap-3 items-center bg-white rounded-2xl px-4 py-3 border border-slate-100">
              <span className="col-span-1 text-xs text-slate-300 font-mono">{g.grid}</span>
              <input
                value={g.grname ?? ""}
                onChange={(e) => updateGroup(i, e.target.value)}
                placeholder="ชื่อกลุ่มความเสี่ยง..."
                className="col-span-9 h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="col-span-2 flex justify-end">
                <button onClick={() => removeGroup(i)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={addGroup} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 px-4 py-2.5 w-full border-2 border-dashed border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all">
            <Plus size={13} /> เพิ่มกลุ่ม
          </button>
        </div>
      </Section>

      {/* ── Section 2: riskgroupdt ── */}
      <Section icon={<List size={16} />} title="ประเภทย่อย" subtitle="riskgroupdt">
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-3 px-4 pb-1">
            <p className="col-span-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</p>
            <p className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อประเภทย่อย</p>
            <p className="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">สังกัดกลุ่ม</p>
            <p className="col-span-2" />
          </div>
          {dts.map((d, i) => (
            <div key={d.dtgrid} className="grid grid-cols-12 gap-3 items-center bg-white rounded-2xl px-4 py-3 border border-slate-100">
              <span className="col-span-1 text-xs text-slate-300 font-mono">{d.dtgrid}</span>
              <input
                value={d.dtgrname ?? ""}
                onChange={(e) => updateDt(i, "dtgrname", e.target.value)}
                placeholder="ชื่อประเภทย่อย..."
                className="col-span-5 h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <select
                value={d.drid ?? ""}
                onChange={(e) => updateDt(i, "drid", Number(e.target.value))}
                className="col-span-4 h-9 px-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">-- เลือกกลุ่ม --</option>
                {groups.map((g) => (
                  <option key={g.grid} value={g.grid}>{g.grname}</option>
                ))}
              </select>
              <div className="col-span-2 flex justify-end">
                <button onClick={() => removeDt(i)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={addDt} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 px-4 py-2.5 w-full border-2 border-dashed border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all">
            <Plus size={13} /> เพิ่มประเภทย่อย
          </button>
        </div>
      </Section>

      {/* ── Section 3: riskgrouplv ── */}
      <Section icon={<ShieldAlert size={16} />} title="ระดับความรุนแรง" subtitle="riskgrouplv">
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-3 px-4 pb-1">
            <p className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</p>
            <p className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อ (grlvname)</p>
            <p className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</p>
            <p className="col-span-2" />
          </div>
          {lvs.map((l, i) => (
            <div key={l.grlvid} className="grid grid-cols-12 gap-3 items-center bg-white rounded-2xl px-4 py-3 border border-slate-100">
              <input
                value={l.grlvcode ?? ""}
                onChange={(e) => updateLv(i, "grlvcode", e.target.value)}
                placeholder="code"
                className="col-span-2 h-9 px-2 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                value={l.grlvname ?? ""}
                onChange={(e) => updateLv(i, "grlvname", e.target.value)}
                placeholder="ชื่อระดับ..."
                className="col-span-5 h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                value={l.grlvlevel ?? ""}
                onChange={(e) => updateLv(i, "grlvlevel", e.target.value)}
                placeholder="เช่น 1, 2, H, I"
                className="col-span-3 h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="col-span-2 flex justify-end">
                <button onClick={() => removeLv(i)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={addLv} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 px-4 py-2.5 w-full border-2 border-dashed border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all">
            <Plus size={13} /> เพิ่มระดับ
          </button>
        </div>
      </Section>

      {/* ── Section 4: SLA ── */}
      <Section icon={<Clock size={16} />} title="เกณฑ์ SLA" subtitle="Systemconfig">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
              เคสค้างนานเกิน (วัน)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number" min={1} max={90}
                value={slaDays}
                onChange={(e) => setSlaDays(Number(e.target.value))}
                className="w-24 h-12 text-center text-2xl font-black rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="text-slate-400 text-sm font-medium">วัน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">เคสเปิดค้างเกิน {slaDays} วัน นับใน KPI Overdue</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
              Near Miss — grlvcode
            </label>
            <select
              value={nearMissCode}
              onChange={(e) => setNearMissCode(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {lvs.map((l) => (
                <option key={l.grlvid} value={l.grlvcode ?? ""}>{l.grlvcode} — {l.grlvname}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-2">ใช้ filter KPI Near Miss บน Dashboard</p>
          </div>
        </div>
      </Section>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 h-11 px-8 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-blue-600 disabled:opacity-50 transition-all"
        >
          {isPending
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save size={15} />
          }
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="text-slate-500">{icon}</div>
        <div>
          <h3 className="text-base font-black text-slate-800 leading-none">{title}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}