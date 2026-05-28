import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🟢 --- เริ่มการทำงาน API /api/options ---");

    // Step 1: ดึงแผนก
    console.log("⏳ 1. กำลังดึงข้อมูล แผนก (riskdepart)...");
    const departments = await prisma.riskdepart.findMany({
      select: { depid: true, depname: true },
      orderBy: { depname: 'asc' }
    });
    console.log(`✅ สำเร็จ: ได้แผนกมา ${departments.length} รายการ`);

    // Step 2: ดึงหมวดหลัก + หมวดย่อย
    // ⚠️ ตรง include: เปลี่ยนเป็น riskgroupdt เพราะ Prisma มักจะดึงชื่อตารางมาตั้งเป็นชื่อ Relation ถ้าไม่ได้ตั้งชื่อเอง
    console.log("⏳ 2. กำลังดึงข้อมูล กลุ่มความเสี่ยง (riskgroup + riskgroupdt)...");
    const riskGroups = await prisma.riskgroup.findMany({
      include: {
        riskgroupdt: true, // <--- ลองใช้ชื่อตารางตรงๆ แบบนี้ดูก่อนครับ
      },
      orderBy: { grid: 'asc' }
    });
    console.log(`✅ สำเร็จ: ได้กลุ่มความเสี่ยงหลักมา ${riskGroups.length} รายการ`);

    // Step 3: ดึงระดับความรุนแรง
    console.log("⏳ 3. กำลังดึงข้อมูล ความรุนแรง (riskgrouplv)...");
    const severityClinic = await prisma.riskgrouplv.findMany({ 
      where: { grlvlevel: "1" },
      orderBy: { grlvcode: 'asc' }
    });
    const severityGen = await prisma.riskgrouplv.findMany({ 
      where: { grlvlevel: "2" },
      orderBy: { grlvcode: 'asc' }
    });
    console.log(`✅ สำเร็จ: Clinic ${severityClinic.length} รายการ, Gen ${severityGen.length} รายการ`);

    console.log("🚀 --- ดึงข้อมูลครบถ้วน ส่งให้หน้าเว็บ ---");
    return NextResponse.json({
      departments,
      riskGroups, // ข้อมูลนี้จะถูกดึงไปใช้ทำ Dropdown ทั้งหมวดหลักและย่อย
      severityClinic,
      severityGen
    });

  } catch (error: any) {
    // โชว์ Error แบบละเอียดจัดเต็ม
    console.error("❌ --------------------------------- ❌");
    console.error("💥 พังจ้า! API ERROR รายละเอียดตามนี้:");
    console.error("ข้อความ:", error.message);
    if (error.code) console.error("Prisma Error Code:", error.code);
    if (error.meta) console.error("Prisma Error Meta:", error.meta);
    console.error("❌ --------------------------------- ❌");
    
    return NextResponse.json({ 
      error: "Failed to fetch options", 
      details: error.message 
    }, { status: 500 });
  }
}