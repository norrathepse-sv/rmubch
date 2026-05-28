import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);


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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. ตรวจสอบข้อมูลเบื้องต้น (Validation)
    if (!body.riskname || !body.depreport) {
       return NextResponse.json({ message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" }, { status: 400 });
    }

    // 2. จัดการ ID (ในกรณีที่แก้ Schema ไม่ได้จริงๆ)
    // ใช้ Transaction เพื่อความปลอดภัยระดับหนึ่ง
    const newRisk = await prisma.$transaction(async (tx) => {
      const lastRisk = await tx.riskmain.findFirst({
        orderBy: { riskid: 'desc' },
        select: { riskid: true }
      });
      const nextId = (lastRisk?.riskid || 0) + 1;

      // 3. จัดการเวลา (Timezone TH)
      // ปรับเวลาบันทึก (riskdaterep) ให้เป็น Asia/Bangkok
      const bangkokNow = dayjs().tz("Asia/Bangkok").toDate();

      return await tx.riskmain.create({
        data: {
          riskid: nextId,
          riskhn: body.riskhn || null,
          riskname: body.riskname,
          riskage: body.riskage || null,
          // ใช้ dayjs ช่วย parse วันที่ให้แม่นยำขึ้น
          daterigter: body.daterigter 
  ? new Date(`${body.daterigter.split('T')[0]}T12:00:00+07:00`) 
  : null,
        
                  // บันทึกเวลาที่ส่งมาจาก AntD (HH:mm)
         timepicker: extractTimeOnly(body.timepicker),
          depreport: body.depreport,
          todep: Array.isArray(body.todep) ? body.todep.join(", ") : (body.todep || ""),
          risktype: body.risktype,
          risktypedt: body.risktypedt || null,
          risktypedrug: body.risktypedrug || null,
          risktypedrugresult: body.risktypedrugresult || null,
          clinicseverity: body.clinicseverity || null,
          genseverity: body.genseverity || null,
          riskpresent: body.riskpresent,
          riskfirstedit: body.riskfirstedit || null,
          riskstatus: "1",
          riskshow: "1",
          riskdaterep: bangkokNow, 
          riskheadreply: body.riskheadreply || null,
        
        },
      });
    });

    return NextResponse.json({ message: "ok", data: newRisk }, { status: 201 });
  } catch (error: any) {
    console.error("Save Error:", error);
    return NextResponse.json({ 
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const dept = searchParams.get("dept");
  const mode = searchParams.get("mode"); // inbound หรือ outbound

  const whereCondition: any = {
    risktype: type,
  };

  if (mode === "inbound") {
    whereCondition.depreport = dept;
    // เพิ่มเงื่อนไขอื่นๆ เช่น ปีงบประมาณ หรือ todep ของ user ปัจจุบัน
  } else {
    whereCondition.todep = dept;
  }

  const risks = await prisma.riskmain.findMany({
    where: whereCondition,
    orderBy: { daterigter: "desc" },
    select: {
      riskid: true,
      daterigter: true,
     // riskdetail: true,
      clinicseverity: true,
      riskheadreply:true
    }
  });

  return NextResponse.json(risks);
}