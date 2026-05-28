// components/ExportAllExcelButton.tsx
"use client";

import { FileSpreadsheet } from "lucide-react";

export default function ExportAllExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("ไม่มีข้อมูลสำหรับดึงรายงาน");
      return;
    }

    // ฟังก์ชันล้าง HTML Tags ออกจากข้อความ
    const stripHtml = (html: string | null) => {
      if (!html) return "-";
      return html.replace(/<[^>]*>?/gm, '').trim();
    };

    // 1. กำหนดหัวคอลัมน์ (Headers)
    const headers = [
      "Incident ID", 
      "วันที่เกิดเหตุ", 
      "ประเภทความเสี่ยง", 
      "หัวข้ออุบัติการณ์",
      "ระดับความรุนแรง", 
      "จากหน่วยงาน", 
      "ถึงหน่วยงาน",
      "รายละเอียดเหตุการณ์", 
      "การแก้ไขเบื้องต้น",
      "วิเคราะห์สาเหตุ"
    ];

    // 2. วน Loop ข้อมูลทั้งหมดเพื่อสร้างแต่ละบรรทัด (Rows)
    const csvRows = data.map(row => {
      const rowData = [
        row.riskid,
        row.daterigter ? new Date(row.daterigter).toLocaleDateString('th-TH') : '-',
        row.risktype || "-",
        row.riskpresent || "-",
        row.clinicseverity || "-",
        row.depreport || "-",
        row.todep || "-",
        stripHtml(row.riskdetail || row.riskpresent),
        stripHtml(row.riskfirstedit),
        stripHtml(row.riskcauseanalysis)
      ];
      // แปลงข้อมูลแต่ละช่องให้มี "" ครอบไว้ กันปัญหาเครื่องหมายลูกน้ำ (,) แทรกในข้อความ
      return rowData.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",");
    });

    // 3. รวม Header และข้อมูลเข้าด้วยกัน พร้อมใส่ BOM (\ufeff) ให้ Excel อ่านภาษาไทยได้
    const csvContent = "\ufeff" + headers.map(h => `"${h}"`).join(",") + "\n" + csvRows.join("\n");

    // 4. สั่งดาวน์โหลดไฟล์
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    // ตั้งชื่อไฟล์พร้อมวันที่ปัจจุบัน
    link.setAttribute("download", `Risk_All_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors shadow-sm"
      title="ส่งออกข้อมูลทั้งหมดเป็นไฟล์ Excel"
    >
      <FileSpreadsheet size={18} />
      <span className="hidden sm:inline">Export All (Excel)</span>
    </button>
  );
}