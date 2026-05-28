export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: any) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // console.log("ตรวจสอบ Token:", token);

    if (!token || !token.department) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }

    const userDept = token.department as string;

    const count = await prisma.riskmain.count({
      where: {
        riskstatus: "1", 
        todep: { contains: userDept },
        is_read: false, 
        // daterigter: { gte: today }, // แนะนำให้ปิดไว้ก่อน เพื่อให้นับงานค้างทั้งหมดที่ยังไม่ได้อ่าน
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("🔔 API Error:", error);
    return NextResponse.json({ count: 0 }); // คืนค่า 0 เพื่อไม่ให้หน้าบ้านพัง
  }
}