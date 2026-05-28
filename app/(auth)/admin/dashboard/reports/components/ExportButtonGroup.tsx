"use client";

import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

interface ExportButtonGroupProps {
  groupedData: Record<string, { total: number; subCategories: Record<string, any[]> }>;
  groupNames: Record<string, string>;
  filenamePrefix: string;
}

export default function ExportButtonGroup({ groupedData, groupNames, filenamePrefix }: ExportButtonGroupProps) {
  const dateStr = dayjs().format("YYYYMMDD_HHmm");
  const fileName = `${filenamePrefix}_${dateStr}`;

  // -----------------------------------------------------
  // 1. ฟังก์ชัน Export Excel (ใช้ ExcelJS จัดรูปแบบสวยงาม)
  // -----------------------------------------------------
const exportExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("รายงานอุบัติการณ์");

  // 1. กำหนดคอลัมน์
  sheet.columns = [
    { header: "ลำดับ", key: "no", width: 10 },
    { header: "ประเภทความเสี่ยง", key: "mainCat", width: 40 },
    { header: "หมวดย่อย", key: "subCat", width: 30 },
    { header: "รายละเอียดอุบัติการณ์", key: "detail", width: 60 },
    { header: "ระดับ", key: "severity", width: 15 }, // เพิ่มความกว้างรองรับการโชว์คู่
    { header: "จำนวน", key: "count", width: 10 }
  ];

  // ตกแต่ง Header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // 2. จัดการข้อมูลก่อนใส่ลง Excel
  let mainIdx = 1;
  
  // เรียงหมวดหมู่หลัก (1, 2, 3...)
  const sortedMainCategories = Object.entries(groupedData).sort(([keyA], [keyB]) => {
    const numA = parseInt(keyA) || 999;
    const numB = parseInt(keyB) || 999;
    return numA - numB;
  });

  sortedMainCategories.forEach(([mainType, mainCatData]) => {
    const mainTypeName = groupNames[mainType] || `รหัส ${mainType}`;
    let subIdx = 1;

    // เรียงหมวดย่อยตามตัวเลขในวงเล็บ (1), (2)...
    const sortedSubCategories = Object.entries(mainCatData.subCategories).sort(([keyA], [keyB]) => {
      const numA = parseInt(keyA.replace(/[^0-9]/g, '')) || 999;
      const numB = parseInt(keyB.replace(/[^0-9]/g, '')) || 999;
      return numA - numB;
    });

    sortedSubCategories.forEach(([subType, incidents]) => {
      incidents.forEach((incident) => {
        // เตรียมข้อมูลระดับความรุนแรง (เอาเฉพาะตัวหน้า)
        const cSev = incident.clinicseverity?.toString().trim().charAt(0).toUpperCase() || "";
        const gSev = incident.genseverity?.toString().trim().charAt(0).toUpperCase() || "";
        const displaySeverity = (cSev && gSev) ? `${cSev}/${gSev}` : (cSev || gSev || "-");

        // ลบ Tag HTML <br> และอื่นๆ ออกจากรายละเอียด
        const cleanDetail = incident.riskpresent
          ?.replace(/<[^>]*>/g, '')
          ?.replace(/&nbsp;/g, ' ')
          ?.trim() || "ไม่มีรายละเอียด";

        sheet.addRow({
          no: `${mainIdx}.${subIdx}`,
          mainCat: mainTypeName,
          subCat: subType,
          detail: cleanDetail,
          severity: displaySeverity,
          count: incident.count || 1 // ใช้ค่า count ที่นับมาแล้วจากการ Group
        });
      });
      subIdx++;
    });
    mainIdx++;
  });

  // 3. ตกแต่งเส้นขอบและการจัดวาง
// ตีเส้นขอบตาราง (Borders) และจัดรูปแบบการวางแนว
sheet.eachRow((row, rowNumber) => {
  // colNumber คือลำดับคอลัมน์ (1, 2, 3, ...)
  row.eachCell((cell, colNumber) => {
    // 1. ตั้งค่า Font พื้นฐาน
    if (!cell.font || !cell.font.color) {
      cell.font = { size: 11 };
    }

    // 2. ตีเส้นขอบทุกด้าน
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };

    // 3. จัดการ Alignment (ยกเว้น Header row ที่ 1)
    if (rowNumber > 1) {
      cell.alignment = {
        vertical: "middle",
        // ถ้า colNumber เป็น 4 (รายละเอียดอุบัติการณ์) ให้ชิดซ้าย ที่เหลือจัดกลาง
        horizontal: colNumber === 4 ? "left" : "center",
        // ให้คอลัมน์ที่ 4 ตัดบรรทัดอัตโนมัติถ้าข้อความยาว
        wrapText: colNumber === 4 
      };
    }
  });
});

  // 4. บันทึกไฟล์
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};

  // -----------------------------------------------------
  // 2. ฟังก์ชัน Export PDF (แคปเจอร์จากหน้าจอเว็บ)
  // -----------------------------------------------------
const exportPDF = async () => {
  if (typeof window === "undefined") return;

  const element = document.getElementById("report-content");
  if (!element) {
    alert("ไม่พบข้อมูลรายงาน");
    return;
  }

 
  const html2pdf = (await import("html2pdf.js" as any)).default;

  const opt = {
    margin: [0.5, 0.5], // [บน, ล่าง] (นิ้ว)
    filename: `${fileName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      letterRendering: true // ช่วยเรื่องการแสดงผลตัวอักษร
    },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // ป้องกันตารางขาดกลางหน้า
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error("PDF Export Error:", error);
  }
};

  // -----------------------------------------------------
  // 3. ฟังก์ชัน Export Word (สร้างไฟล์ .doc โดยตรง)
  // -----------------------------------------------------
  const exportWord = () => {
    const element = document.getElementById("report-content");
    if (!element) return;

    const htmlContent = element.innerHTML;
    // โครงสร้างไฟล์ Word พื้นฐาน
    const wordDocument = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Export to Word</title>
        <style>
          body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif; font-size: 14pt; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #999999; padding: 6px 10px; text-align: left; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; }
          h3, h4 { color: #1e3a8a; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordDocument], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-3">
      <button 
        onClick={exportExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-sm border border-green-200 rounded-lg text-sm font-bold transition-all"
        title="ดาวน์โหลดเป็น Excel"
      >
        <FileSpreadsheet size={18} /> Excel
      </button>
      <button 
        onClick={exportWord}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm border border-blue-200 rounded-lg text-sm font-bold transition-all"
        title="ดาวน์โหลดเป็น Word"
      >
        <FileText size={18} /> Word
      </button>
      {/* <button 
        onClick={exportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-sm border border-red-200 rounded-lg text-sm font-bold transition-all"
        title="ดาวน์โหลดเป็น PDF"
      >
        <File size={18} /> PDF
      </button> */}
    </div>
  );
}