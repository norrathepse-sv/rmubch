"use client";

// components/DashboardFilterBar.tsx — Fixed
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CalendarDays, Building2, ShieldAlert, RotateCcw, Search } from "lucide-react";

interface DashboardFilterBarProps {
  departments: string[];
  currentFrom?:     string;
  currentTo?:       string;
  currentDept?:     string;
  currentSeverity?: string;
}

const SEVERITY_OPTIONS = [
  { value: "",         label: "ทุกระดับ" },
  { value: "low",      label: "ต่ำ" },
  { value: "medium",   label: "ปานกลาง" },
  { value: "high",     label: "สูง" },
  { value: "critical", label: "วิกฤต" },
];

export default function DashboardFilterBar({
  departments,
  currentFrom     = "",
  currentTo       = "",
  currentDept     = "",
  currentSeverity = "",
}: DashboardFilterBarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [dateFrom, setDateFrom] = useState(currentFrom);
  const [dateTo,   setDateTo  ] = useState(currentTo);
  const [dept,     setDept    ] = useState(currentDept);
  const [severity, setSeverity] = useState(currentSeverity);

  function applyFilters() {
    const params = new URLSearchParams();
    if (dateFrom) params.set("from",     dateFrom);
    if (dateTo)   params.set("to",       dateTo);
    if (dept)     params.set("dept",     dept);
    if (severity) params.set("severity", severity);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function resetFilters() {
    setDateFrom(""); setDateTo(""); setDept(""); setSeverity("");
    startTransition(() => router.push(pathname));
  }

  const hasFilter = !!(dateFrom || dateTo || dept || severity);

  return (
    <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-5">
      <div className="flex flex-wrap gap-3 items-end">

        {/* ── Date From ── */}
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <CalendarDays size={11} /> ตั้งแต่
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
        </div>

        {/* ── Date To ── */}
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <CalendarDays size={11} /> ถึง
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
        </div>

        {/* ── Department ── */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Building2 size={11} /> แผนก
          </label>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white transition-all"
          >
            <option value="">ทุกแผนก</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* ── Severity ── */}
        {/* <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldAlert size={11} /> ระดับความรุนแรง
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white transition-all"
          >
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div> */}

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Buttons ── */}
        <div className="flex gap-2 items-center">
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw size={12} /> รีเซ็ต
            </button>
          )}
          <button
            onClick={applyFilters}
            disabled={isPending}
            className="h-10 px-5 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search size={13} />
            )}
            ค้นหา
          </button>
        </div>

      </div>

      {/* Active filters pills */}
      {hasFilter && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest self-center">กรองโดย:</span>
          {dateFrom && <Pill label={`ตั้งแต่ ${dateFrom}`} onRemove={() => setDateFrom("")} />}
          {dateTo   && <Pill label={`ถึง ${dateTo}`}       onRemove={() => setDateTo("")} />}
          {dept     && <Pill label={dept}                  onRemove={() => setDept("")} />}
          {severity && <Pill label={SEVERITY_OPTIONS.find(s => s.value === severity)?.label ?? severity} onRemove={() => setSeverity("")} />}
        </div>
      )}
    </div>
  );
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors leading-none">✕</button>
    </span>
  );
}
