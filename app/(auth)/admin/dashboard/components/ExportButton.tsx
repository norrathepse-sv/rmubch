"use client";

// components/ExportButton.tsx
// ปุ่ม Export PDF (window.print) และ Excel (xlsx)
// ติดตั้ง: npm install xlsx

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

interface ExportData {
  riskid: number | string;
  daterigter?: string | Date | null;
  risktypedt?: string | null;
  depreport?: string | null;
  riskstatus?: string | null;
  clinicseverity?: string | null;
  genseverity?: string | null;
}

interface ExportButtonProps {
  // ส่ง data ที่ดึงจาก server มาใน props
  // หรือถ้าต้องการ fetch ใหม่ก็ทำใน onClick ได้เลย
  data?: ExportData[];
  filename?: string;
}

// Map status code → label ภาษาไทย
function statusLabel(s?: string | null) {
  const map: Record<string, string> = {
    "1": "รอตรวจสอบ",
    "2": "รอผู้บริหาร",
    "3": "กำลังดำเนินการ",
    "4": "ปิดแล้ว",
  };
  return s ? (map[s] ?? s) : "-";
}

export default function ExportButton({ data = [], filename = "risk-report" }: ExportButtonProps) {
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);

  // ── Export Excel ──────────────────────────────────────────
  async function handleExcel() {
    setLoading("excel");
    try {
      const XLSX = await import("xlsx");

      const rows = data.map((d) => ({
        "รหัสเคส": d.riskid,
        "วันที่รายงาน": d.daterigter
          ? new Date(d.daterigter).toLocaleDateString("th-TH")
          : "-",
        "ประเภทความเสี่ยง": d.risktypedt ?? "-",
        "แผนก": d.depreport ?? "-",
        "สถานะ": statusLabel(d.riskstatus),
        "ความรุนแรง (คลินิก)": d.clinicseverity ?? "-",
        "ความรุนแรง (ทั่วไป)": d.genseverity ?? "-",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // ปรับความกว้างคอลัมน์
      ws["!cols"] = [
        { wch: 10 }, { wch: 16 }, { wch: 30 }, { wch: 20 },
        { wch: 16 }, { wch: 18 }, { wch: 18 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Risk Report");
      XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error("Export Excel failed", err);
      alert("เกิดข้อผิดพลาดในการ export Excel\nกรุณาติดตั้ง: npm install xlsx");
    } finally {
      setLoading(null);
    }
  }

  // ── Export PDF (Print) ────────────────────────────────────
  function handlePdf() {
    setLoading("pdf");
    // เพิ่ม class เพื่อให้ CSS print ซ่อน navbar/sidebar
    document.body.classList.add("printing-dashboard");
    setTimeout(() => {
      window.print();
      document.body.classList.remove("printing-dashboard");
      setLoading(null);
    }, 300);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Excel */}
      <button
        onClick={handleExcel}
        disabled={loading !== null}
        className="
          flex items-center gap-2 h-9 px-4 rounded-xl
          border border-emerald-200 bg-emerald-50 text-emerald-700
          text-xs font-bold
          hover:bg-emerald-100 hover:border-emerald-300
          disabled:opacity-50 transition-all
        "
      >
        {loading === "excel" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={13} />
        )}
        Excel
      </button>

      {/* PDF */}
      <button
        onClick={handlePdf}
        disabled={loading !== null}
        className="
          flex items-center gap-2 h-9 px-4 rounded-xl
          border border-red-200 bg-red-50 text-red-700
          text-xs font-bold
          hover:bg-red-100 hover:border-red-300
          disabled:opacity-50 transition-all
        "
      >
        {loading === "pdf" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileText size={13} />
        )}
        PDF
      </button>

      {/* ดาวน์โหลดทั้งหมด (shortcut) */}
      <button
        onClick={handleExcel}
        disabled={loading !== null}
        className="
          flex items-center gap-1.5 h-9 px-3 rounded-xl
          border border-slate-200 text-slate-400
          text-xs font-bold
          hover:bg-slate-50 hover:text-slate-600
          disabled:opacity-50 transition-all
        "
        title="Export ทั้งหมด"
      >
        <Download size={13} />
      </button>
    </div>
  );
}
