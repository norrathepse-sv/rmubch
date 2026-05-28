"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveRiskGroups(
  groups: { grid: number; grname: string | null; dtgrid: number | null }[]
) {
  await Promise.all(
    groups.map((g) =>
      prisma.riskgroup.upsert({
        where:  { grid: g.grid },
        update: { grname: g.grname, dtgrid: g.dtgrid },
        create: { grname: g.grname, dtgrid: g.dtgrid },
      })
    )
  );
  revalidatePath("/admin/settings");
}

export async function saveRiskGroupDt(
  dts: { dtgrid: number; dtgrname: string | null; drid: number | null }[]
) {
  await Promise.all(
    dts.map((d) =>
      prisma.riskgroupdt.upsert({
        where:  { dtgrid: d.dtgrid },
        update: { dtgrname: d.dtgrname, drid: d.drid },
        create: { dtgrname: d.dtgrname, drid: d.drid },
      })
    )
  );
  revalidatePath("/admin/settings");
}

export async function saveRiskGroupLv(
  lvs: { grlvid: number; grlvcode: string | null; grlvname: string | null; grlvlevel: string | null }[]
) {
  await Promise.all(
    lvs.map((l) =>
      prisma.riskgrouplv.upsert({
        where:  { grlvid: l.grlvid },
        update: { grlvcode: l.grlvcode, grlvname: l.grlvname, grlvlevel: l.grlvlevel },
        create: { grlvcode: l.grlvcode, grlvname: l.grlvname, grlvlevel: l.grlvlevel },
      })
    )
  );
  revalidatePath("/admin/settings");
}

export async function saveSlaConfig(config: { slaDays: number; nearMissCode: string }) {
  await Promise.all([
    prisma.systemconfig.upsert({
      where:  { key: "sla_overdue_days" },
      update: { value: String(config.slaDays) },
      create: { key: "sla_overdue_days", value: String(config.slaDays) },
    }),
    prisma.systemconfig.upsert({
      where:  { key: "near_miss_code" },
      update: { value: config.nearMissCode },
      create: { key: "near_miss_code", value: config.nearMissCode },
    }),
  ]);
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}