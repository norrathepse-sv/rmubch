import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NavbarButtons from "../../components/Navbar";

export default async function DepartmentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ตรวจสอบ Session ฝั่ง Server (ปลอดภัยและรวดเร็ว)
  const session = await getServerSession(authOptions);

  // ถ้ายังไม่ล็อกอิน ให้เตะกลับไปหน้า Login
  if (!session || !session.user) {
    redirect("/login");
  }

  // ดึงชื่อหน่วยงาน (ถ้าไม่มีให้แสดงค่า Default ป้องกัน UI แหว่ง)
  const userDep = session.user.department || "ไม่ระบุหน่วยงาน";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header / Navbar */}
      {/* ใช้ sticky top-0 z-50 เพื่อให้เมนูติดหนึบอยู่ด้านบนเสมอเวลาเลื่อนหน้าจอ */}
      <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
        <div className="container mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            {/* กล่องโลโก้จำลอง (ถ้ามีรูปโลโก้ รพ. สามารถเปลี่ยนเป็น <Image /> ได้) */}
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-inner border border-blue-400/30">
              <span className="text-white font-black text-sm">RM</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-50">
              RMUBCH <span className="text-blue-400 font-bold">SYSTEM</span>
            </span>
          </div>

          {/* User Menu */}
          <NavbarButtons
            userName={userDep} // ส่งชื่อหน่วยงานไปแสดงผลที่ Navbar
            status="authenticated"
            session={session}
          />
          
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}