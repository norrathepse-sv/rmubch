import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ปรับ path ตามไฟล์ prisma client ของคุณ

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body; // รับเป็น Array ของ IDs เช่น ["1", "2", "3"]

    // 1. Validation: ตรวจสอบว่า ids เป็น Array และไม่ว่าง
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: 'ID ไม่ถูกต้อง หรือ ไม่ได้เลือกรายการ' },
        { status: 400 }
      );
    }

    // 2. ใช้ Prisma ลบข้อมูลทั้งหมดที่อยู่ในรายการ ids
    const result = await prisma.riskmain.deleteMany({
      where: {
        riskid: {
          in: ids, // ใช้โอเปอเรเตอร์ 'in' สำหรับลบหลายรายการพร้อมกัน
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `ลบสำเร็จ ${result.count} รายการ`,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Prisma Error:', error);

    // กรณีเกิด Error จาก Prisma (เช่น มี Foreign Key ผูกไว้)
    return NextResponse.json(
      { message: 'ไม่สามารถลบข้อมูลได้ เนื่องจากมีข้อมูลที่เกี่ยวข้องอยู่' },
      { status: 500 }
    );
  }
}