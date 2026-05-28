"use client";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

export default function ExportButton({ data, filename }: { data: any[], filename: string }) {
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Risks");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
    >
      <Download size={18} />
      Export Excel
    </button>
  );
}