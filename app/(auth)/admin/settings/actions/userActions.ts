"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDepartUser(data: {
  depname: string;
  depuser: string;
  deppass: string;
  deplevel: string;
}) {
  try {
    const existing = await prisma.riskdepart.findFirst({
      where: { depuser: data.depuser },
    });
    if (existing) return { success: false, error: "Username นี้มีในระบบแล้ว" };

    const user = await prisma.riskdepart.create({
      data: {
        depname:  data.depname || null,
        depuser:  data.depuser,
        deppass:  data.deppass,   // plaintext ตาม schema เดิม
        deplevel: data.deplevel,
      },
      select: { depid: true, depname: true, depuser: true, deplevel: true },
    });

    revalidatePath("/admin/settings");
    return { success: true, user };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาด" };
  }
}

export async function updateDepartLevel(depid: number, deplevel: string) {
  await prisma.riskdepart.update({ where: { depid }, data: { deplevel } });
  revalidatePath("/admin/settings");
}

export async function resetDepartPassword(depid: number) {
  try {
    const tempPassword =
      Math.random().toString(36).slice(-4).toUpperCase() +
      Math.floor(1000 + Math.random() * 9000);

    await prisma.riskdepart.update({
      where: { depid },
      data:  { deppass: tempPassword },
    });

    return { success: true, tempPassword };
  } catch {
    return { success: false, tempPassword: "" };
  }
}