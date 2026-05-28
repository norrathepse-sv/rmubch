"use client"; // 👈 สำคัญมาก เพื่อให้ใช้ onClick ได้

import { Printer } from "lucide-react";

export default function PrintButton({ riskId }: { riskId?: number }) {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all no-print"
    >
      <Printer size={18} />
      <span>พิมพ์รายงาน</span>
    </button>
  );
}