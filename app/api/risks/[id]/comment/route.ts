import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } // เปลี่ยนเป็น Promise
) {
  // 1. ต้อง await ค่า params ก่อนใช้งาน
  const { id } = await context.params; 
  
  // 2. นำ id ไปใช้ต่อตามปกติ (เช่นแปลงเป็น Number)
  const riskId = Number(id);
  try {
    const { riskcommenthead } = await request.json();
    
    const updated = await prisma.riskmain.update({
      where: { riskid: riskId },
      data: { 
        riskcommenthead: riskcommenthead,
        // อาจจะเพิ่มวันที่ตรวจสอบอัตโนมัติ
        // datecheck: new Date() 
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}