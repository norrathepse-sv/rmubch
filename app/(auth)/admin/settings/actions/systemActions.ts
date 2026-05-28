"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ── บันทึกชื่อโรงพยาบาล ──
export async function saveHospitalConfig(data: {
  hospitalName:    string;
  hospitalSubname: string;
  logoUrl:         string;
}) {
  const session = await getServerSession(authOptions);

  await Promise.all([
    prisma.$executeRaw`INSERT INTO "Systemconfig" (key, value) VALUES ('hospital_name',    ${data.hospitalName})    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    prisma.$executeRaw`INSERT INTO "Systemconfig" (key, value) VALUES ('hospital_subname', ${data.hospitalSubname}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    prisma.$executeRaw`INSERT INTO "Systemconfig" (key, value) VALUES ('logo_url',         ${data.logoUrl})         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
  ]);

  // บันทึก audit log
  await writeAuditLog({
    userName: session?.user?.name ?? "system",
    action:   "UPDATE",
    target:   "Systemconfig",
    detail:   "แก้ไขข้อมูลโรงพยาบาล",
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}

// ── Export ข้อมูล riskmain เป็น JSON ──
export async function exportDatabase() {
  const session = await getServerSession(authOptions);

  const data = await prisma.riskmain.findMany({
    orderBy: { riskid: "desc" },
  });

  await writeAuditLog({
    userName: session?.user?.name ?? "system",
    action:   "EXPORT",
    target:   "riskmain",
    detail:   `Export ${data.length} รายการ`,
  });

  const json    = JSON.stringify(data, null, 2);
  const base64  = Buffer.from(json).toString("base64");
  const url     = `data:application/json;base64,${base64}`;
  const filename = `rmubch-backup-${new Date().toISOString().slice(0, 10)}.json`;

  return { url, filename };
}

// ── Helper: เขียน Audit Log ──
export async function writeAuditLog(data: {
  userName?: string;
  action:    string;
  target?:   string;
  detail?:   string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditlog.create({ data });
  } catch {
    // ถ้า table ยังไม่มี ไม่ให้ crash
  }
}