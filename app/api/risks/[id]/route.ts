import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// 🌟 1. เพิ่มฟังก์ชันดึงเฉพาะ HH:mm ไว้ด้านบนสุด (ก่อน export)
const extractTimeOnly = (timeStr: any) => {
  if (!timeStr) return null;
  // ค้นหาเฉพาะตัวเลขเวลา HH:mm ในข้อความ
  const match = String(timeStr).match(/([01]\d|2[0-3]):([0-5]\d)/);
  if (match) {
    // ได้ HH:mm แล้วเอามาประกอบร่างเป็นวันที่แบบสมบูรณ์
    return new Date(`1970-01-01T${match[0]}:00+07:00`);
  }
  return null;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const riskIdNumeric = Number(id);

    if (isNaN(riskIdNumeric)) {
      return NextResponse.json({ message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const risk = await prisma.riskmain.findUnique({
      where: { riskid: riskIdNumeric },
    });

    if (!risk) {
      return NextResponse.json({ message: "ไม่พบข้อมูลอุบัติการณ์" }, { status: 404 });
    }

    return NextResponse.json(risk);
  } catch (error: any) {
    console.error("Get Error:", error);
    return NextResponse.json({
      message: "ไม่สามารถดึงข้อมูลได้",
      error: error.message,
    }, { status: 500 });
  }
}

export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const body = await req.json();
    const riskIdNumeric = Number(id);

    if (isNaN(riskIdNumeric)) {
      return NextResponse.json({ message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const updateRisk = await prisma.riskmain.update({
      where: { riskid: riskIdNumeric },
      data: {
        // --- ข้อมูลพื้นฐาน ---
        riskhn: body.riskhn || null,
        riskname: body.riskname,
        riskage: body.riskage || null,
        
        // --- วันที่และเวลา ---
        daterigter: body.daterigter 
  ? new Date(`${body.daterigter.split('T')[0]}T12:00:00+07:00`) 
  : null,
        
        // 🌟 2. เรียกใช้ฟังก์ชัน extractTimeOnly แทนของเดิม
        timepicker: extractTimeOnly(body.timepicker),

        // --- หน่วยงานและประเภท ---
        depreport: body.depreport,
        todep: Array.isArray(body.todep) ? body.todep.join(", ") : (body.todep || ""),
        risktype: body.risktype,
        risktypedt: body.risktypedt,
        
        // --- รายละเอียดความเสี่ยงเฉพาะทาง ---
        risktypedrug: body.risktypedrug || null,
        risktypedrugresult: body.risktypedrugresult || null,
        clinicseverity: body.clinicseverity || null,
        genseverity: body.genseverity || null,
        
        // --- บรรยายเหตุการณ์และการแก้ไข ---
        riskpresent: body.riskpresent,
        riskfirstedit: body.riskfirstedit || null,

        // --- เพิ่มฟิลด์สำหรับหัวหน้างาน ---
        riskresultedit: body.riskresultedit || null,
        riskcommenthead: body.riskcommenthead || null,
        riskheadreply: body.riskheadreply || null,


        // --- สถานะ ---
        riskstatus: body.riskstatus || "1", 
      },
    });

    return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ", data: updateRisk });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ 
      message: "ไม่สามารถอัปเดตข้อมูลได้", 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const riskIdNumeric = Number(id);

    if (isNaN(riskIdNumeric)) {
      return NextResponse.json({ message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const deleteRisk = await prisma.riskmain.delete({
      where: { riskid: riskIdNumeric },
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", data: deleteRisk });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ 
      message: "ไม่สามารถลบข้อมูลได้", 
      error: error.message 
    }, { status: 500 });
  }
} 
    