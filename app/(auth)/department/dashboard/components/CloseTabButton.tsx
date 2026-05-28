"use client";

export default function CloseTabButton() {
  return (
    <button
      type="button"
      onClick={() => window.close()}
      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
    >
      ปิดแท็บ
    </button>
  );
}
