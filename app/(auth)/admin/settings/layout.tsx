import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ตรวจสอบ path ให้ถูกต้อง


import NavbarButtons from "../../components/Navbar";
import AdminSidebar from "../dashboard/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. ดึง session จากฝั่ง Server
  const session = await getServerSession(authOptions);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ── */}
      <AdminSidebar />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ── Top Navbar ── */}
        <header className="h-16 bg-slate-900 flex items-center justify-between px-8 border-b border-slate-700 shadow-lg z-20">
          <div className="text-white font-bold text-lg hidden md:block">
            ระบบจัดการความเสี่ยง <span className="text-blue-400">ADMIN</span>
          </div>
          
          {/* 2. ส่ง props ไปที่ NavbarButtons */}
          <NavbarButtons 
            userName={session?.user?.name || "Admin"} 
            status="authenticated" // เนื่องจากเราเช็ค session แล้ว
            session={session} 
          />
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}