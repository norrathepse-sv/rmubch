"use client";

import { useState, useEffect, type CSSProperties } from "react";

export default function RiskPrintTemplate({ risk, showOnScreen = false }: { risk: any; showOnScreen?: boolean }) {
  const [severityOptions, setSeverityOptions] = useState<any[]>([]);

  useEffect(() => {
    if (showOnScreen) {
      setTimeout(() => {
        window.print();
      }, 0);
    }
  }, [showOnScreen]);

  // ดึงข้อมูล Options จาก API เมื่อ Component Mount เพื่อใช้หา Code (A, B, C...)
  useEffect(() => {
    fetch("/api/options")
      .then((res) => res.json())
      .then((data) => {
        // รวมข้อมูลจากทั้ง severityClinic และ severityGen เพื่อการค้นหาที่ง่ายขึ้น
        const combined = [
          ...(data.severityClinic || []),
          ...(data.severityGen || []),
        ];
        setSeverityOptions(combined);
      })
      .catch((err) => console.error("Error fetching options:", err));
  }, []);

  if (!risk) return null;

  // --- Styles สำหรับการพิมพ์ ---
  const styles = {
    label: { fontSize: "9pt" },
    content: { fontSize: "9pt" },
    header: { fontSize: "11pt" },
    small: { fontSize: "9pt" }
  };

  // ฟังก์ชันดึง Code จากชื่อ (เช่น "เกิดเหตุการณ์เกือบพลาด" -> "A")
  const getGrlvCode = (name: string) => {
    if (!name) return "";
    const found = severityOptions.find((opt) => opt.grlvname === name);
    return found ? `[${found.grlvcode}] ` : "";
  };

  // ฟังก์ชันล้าง Tag ว่างเปล่าจาก Rich Text
  const isEmptyRichText = (html: string) => {
    if (!html) return true;
    const cleanText = html.replace(/<[^>]*>/g, "").trim();
    return cleanText === "";
  };

  const style9pt = { fontSize: "9pt !important", lineHeight: "1.4" } as CSSProperties;
  const style9ptBold = { fontSize: "9pt !important", fontWeight: "bold" } as CSSProperties;
  const containerVisibility = showOnScreen ? "block" : "hidden print:block";

  return (
    <div className={`${containerVisibility} w-full text-black bg-white p-10 leading-normal`}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .text-9pt { font-size: 9pt !important; }
          .text-11pt { font-size: 11pt !important; }
          table td { font-size: 9pt !important; border: 1px solid black !important; padding: 6px 8px !important; }
          .rich-text-area * { font-size: 9pt !important; line-height: 1.5 !important; }
        }

        @page {
          size: A4;
          margin: 1cm;
        }

        /* คอนเทนเนอร์หลักต้องมีความสูงขั้นต่ำเพื่อให้ footer ไปอยู่ท้ายได้ */
        .print-container {
          position: relative;
          min-height: 26cm; /* ความสูงประมาณ A4 หักลบ margin */
        }
        .print-footer {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
        }
      `}} />
      {/* 1. Header รายงาน */}
      <div className="text-center mb-8">
        <h1 style={styles.header} className="font-bold uppercase underline mb-2">
          รายงานอุบัติการณ์ความเสี่ยง
        </h1>
        <p className="font-bold text-sm">
          โรงพยาบาลมะเร็งอุบลราชธานี
        </p>
      </div>

      {/* 2. ตารางข้อมูลพื้นฐาน */}
    <table className="w-full border-collapse border border-black mb-5">
        <tbody>
          <tr>
            <td style={style9ptBold} className="bg-gray-50 w-[18%]">รหัสเหตุการณ์</td>
            <td style={style9pt} className="w-[32%]">{risk.riskid}</td>
            <td style={style9ptBold} className="bg-gray-50 w-[18%]">วันที่เกิดเหตุ</td>
            <td style={style9pt} className="w-[32%]">
              {risk.daterigter ? new Date(risk.daterigter).toLocaleDateString('th-TH') : "-"}
              <span className="ml-2">เวลา: {risk.timepicker ? (risk.timepicker instanceof Date ? risk.timepicker.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : risk.timepicker) : "-"}</span>
            </td>
          </tr>
          <tr>
            <td style={style9ptBold} className="bg-gray-50">ผู้ประสบเหตุ</td>
            <td style={style9pt}>{risk.riskname || "-"}</td>
            <td style={style9ptBold} className="bg-gray-50">HN</td>
            <td style={style9pt}>{risk.riskhn || "-"}</td>
          </tr>
          <tr>
            <td style={style9ptBold} className="bg-gray-50">จากหน่วยงาน</td>
            <td style={style9pt}>{risk.depreport || "-"}</td>
            <td style={style9ptBold} className="bg-gray-50">ถึงหน่วยงาน</td>
            <td style={style9pt}>{risk.todep || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* 3. รายละเอียดเหตุการณ์ */}
      <div className="border border-black mb-6 break-inside-avoid">
        <div style={styles.label} className="bg-gray-100 border-b border-black p-2 font-bold">
          รายละเอียดเหตุการณ์
        </div>
        <div className="p-4 min-h-[50px]">
          <div 
            style={styles.content}
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: risk.riskpresent || "-" }} 
          />
        </div>
      </div>

      {/* 4. รูปแบบเหตุการณ์และความรุนแรง */}
      <div className="border border-black mb-6 break-inside-avoid">
        <div style={styles.label} className="bg-gray-100 border-b border-black p-2 font-bold">
          รูปแบบเหตุการณ์/ระดับความรุนแรง
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span style={styles.label} className="font-bold">ประเภทความเสี่ยง: </span>
            <span style={styles.content}>
              {[risk.risktype, risk.risktypedrug].filter(Boolean).join(" / ") || "-"}
            </span>
          </div>
          
          <div>
            <span style={styles.label} className="font-bold">ระดับความรุนแรง: </span>
            <span style={styles.content}>
              {(() => {
                const clinic = risk.clinicseverity ? `คลินิก ${getGrlvCode(risk.clinicseverity)}${risk.clinicseverity}` : "";
                const gen = risk.genseverity ? `ทั่วไป ${getGrlvCode(risk.genseverity)}${risk.genseverity}` : "";
                return [clinic, gen].filter(Boolean).join(" | ") || "-";
              })()}
            </span>
          </div>

          {/* {risk.risktypedrugresult && (
            <div className="p-2 bg-gray-50 border border-dashed border-gray-400 rounded">
               <span style={styles.small} className="font-bold">รายละเอียดความรุนแรงเพิ่มเติม: </span>
               <span style={styles.small}>{risk.risktypedrugresult}</span>
            </div>
          )} */}
        </div>
      </div>

      {/* 5. การแก้ไขและการสั่งการ */}
      <div className="grid grid-cols-1 gap-6">
        {/* การแก้ไขเบื้องต้น */}
        <div className="border border-black break-inside-avoid">
          <div style={styles.label} className="bg-gray-100 border-b border-black p-2 font-bold">การแก้ไขเบื้องต้น</div>
          <div className="p-4">
            <div 
              style={styles.content}
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: risk.riskfirstedit || "-" }} 
            />
          </div>
        </div>

        {/* ความเห็นหัวหน้างาน */}
        {!isEmptyRichText(risk.riskcommenthead) && (
          <div className="border border-black break-inside-avoid">
            <div style={styles.label} className="bg-gray-100 border-b border-black p-2 font-bold">ความเห็นหัวหน้างาน / สั่งการ</div>
            <div className="p-4">
              <div 
                style={styles.content}
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: risk.riskcommenthead }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. ส่วนลงนาม */}
      <div className="mt-20 grid grid-cols-2 text-center break-inside-avoid">
        <div className="space-y-6">
          <p style={styles.label}>ลงชื่อ...........................................................</p>
          <div style={styles.label}>
            <p>( {risk.riskname || "............................................"} )</p>
            <p className="mt-1 text-gray-600 ">ผู้รายงาน</p>
          </div>
        </div>
        <div className="space-y-6">
          <p style={styles.label}>ลงชื่อ...........................................................</p>
          <div style={styles.label}>
            <p>( ............................................................ )</p>
            <p className="mt-1 text-gray-600 ">หัวหน้าหน่วยงาน / ผู้รับรอง</p>
          </div>
        </div>
      </div>

      {/* Footer วันที่พิมพ์ */}
      <div className="mt-10 text-right text-[8pt] text-gray-400">
        พิมพ์เมื่อวันที่: {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')}
      </div>

    </div>
  );
}