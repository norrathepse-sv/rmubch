import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function PATCH(req: any) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.department) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userDept = token.department as string;

    // อัปเดตทุกรายการที่ยังไม่ได้อ่าน และเป็นของแผนกนี้ ให้เป็นอ่านแล้วทั้งหมด
    await prisma.riskmain.updateMany({
      where: {
        riskstatus: "1",
        todep: { contains: userDept },
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔔 Read All Error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}