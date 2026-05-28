"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CheckRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      const user = session.user as any;

      // เช็กจาก Role ที่เรา Set ไว้ใน authOptions (ADMIN = deplevel 9)
      if (user.role === "ADMIN") {
        router.replace("/admin/dashboard"); // ใช้ replace เพื่อไม่ให้กดย้อนกลับมาหน้านี้ได้
      } else {
        router.replace("/department/dashboard");
      }
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, session, router]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
          <Loader2 className="absolute top-0 animate-spin text-blue-600" size={64} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">กำลังตรวจสอบสิทธิ์</h2>
          <p className="text-slate-400 text-sm font-medium">กรุณารอสักครู่ ระบบกำลังนำคุณไปยังหน้า Dashboard...</p>
        </div>
      </div>
    </div>
  );
}