// app/api/admin/risks/bulk-approve/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ไม่มี ID ที่ส่งมา" }, { status: 400 });
    }

    await prisma.riskmain.updateMany({
      where: { riskid: { in: ids } },
      data: { riskstatus: "4" },
    });

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}