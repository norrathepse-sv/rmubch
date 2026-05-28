"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  BellIcon, 
  LogOut, 
  BarChart3, 
  ChevronDown, 
  PieChart, 
  Users 
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

interface NavbarProps {
  userName: string;
  status: any;
  session: any;
 
}

export default function NavbarButtons({ userName, status, session }: NavbarProps) {
  const [notifCount, setNotifCount] = useState(0);
  // เพิ่ม State สำหรับควบคุมการเปิด-ปิด Dropdown
  const [isReportOpen, setIsReportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || String(user?.level) === "9" || String(user?.role) === "9";
const router = useRouter();
  // ฟังก์ชันดึงจำนวนแจ้งเตือน
const fetchNotifications = async () => {
  if (status !== "authenticated") return;
  try {
    // เพิ่ม timestamp เพื่อป้องกัน Browser cache ผลลัพธ์ของ API
    const res = await fetch(`/api/notifications/count?t=${new Date().getTime()}`);
    
    if (res.ok) {
      const data = await res.json();
      
      // ใช้ Functional Update เพื่อให้ State อัปเดตแน่นอน
      setNotifCount(data.count);
      
      // บังคับให้ Server Component (เช่น Sidebar/Dashboard) ดึงข้อมูลใหม่
      router.refresh(); 
      
      // console.log("อัปเดตจำนวนแจ้งเตือนแล้ว:", data.count);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
};
  

  // ฟังก์ชันอ่านแจ้งเตือนทั้งหมด
  const handleReadAll = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  // ปิด Dropdown เมื่อคลิกที่อื่นข้างนอกเมนู (สำคัญสำหรับ Tablet)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsReportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

useEffect(() => {
  if (status === "authenticated") {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // เช็คทุก 20 วินาที
    return () => clearInterval(interval);
  }
}, [status]);

  if (status === "loading") return <div className="text-slate-500 text-sm">Loading...</div>;

  return (
    <div className="flex items-center gap-6">
      
      {/* --- เมนูรายงานสถิติ (รองรับ Tablet ด้วย onClick) --- */}
      {!isAdmin && (
  <div className="hidden md:block relative" ref={dropdownRef}>
    <button 
      onClick={() => setIsReportOpen(!isReportOpen)}
      className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors py-2 font-medium outline-none focus:outline-none"
    >
      <BarChart3 size={20} className="text-blue-400" />
      <span>รายงานสถิติ</span>
      <ChevronDown 
        size={14} 
        className={`transition-transform duration-200 text-slate-500 ${isReportOpen ? 'rotate-180' : ''}`} 
      />
    </button>

    {/* Dropdown Content */}
    <div className={`absolute top-full left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 mt-2 transition-all duration-200 z-50 
      ${isReportOpen 
        ? 'opacity-100 visible translate-y-0' 
        : 'opacity-0 invisible -translate-y-2 pointer-events-none'}`}
    >
      <Link 
        href="/department/dashboard/reports/by-department"
        onClick={() => setIsReportOpen(false)}
        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 transition-colors"
      >
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <Users size={18} />
        </div>
        <div>
          <p className="font-bold text-sm">แยกตามหน่วยงาน</p>
          <p className="text-[10px] text-slate-400">ดูสถิติการส่งรายงานจากแผนกอื่น</p>
        </div>
      </Link>
      
      <Link 
        href="/department/reports/summary"
        onClick={() => setIsReportOpen(false)}
        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 transition-colors border-t border-slate-100"
      >
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
          <PieChart size={18} />
        </div>
        <div>
          <p className="font-bold text-sm">สรุปภาพรวมแผนก</p>
          <p className="text-[10px] text-slate-400">สถิติความเสี่ยงรายเดือน/ปี</p>
        </div>
      </Link>
    </div>
  </div>
)}

      {/* --- ส่วนขวา: ชื่อหน่วยงาน, แจ้งเตือน และปุ่มออก --- */}
      <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
        {session?.user?.role === "ADMIN" ? (
  <span className="text-slate-300 hidden sm:inline text-sm">
    ยินดีต้อนรับ: <span className="text-white font-semibold italic">ผู้บริหารระบบ</span>
  </span>
) : (
  <span className="text-slate-300 hidden sm:inline text-sm">
    หน่วยงาน: <span className="text-white font-semibold">{userName}</span>
  </span>
)}
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <Link href="/department/dashboard" className="relative p-2 hover:bg-slate-700 rounded-xl transition-all">
              <BellIcon className={`w-6 h-6 ${notifCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>
            {notifCount > 0 && (
              <button 
                onClick={handleReadAll}
                className="text-[9px] text-blue-400 hover:text-blue-300 underline underline-offset-2 -mt-1 px-2"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "http://localhost:3000" })}
          className="bg-slate-700 hover:bg-red-600 transition-colors px-4 py-1.5 rounded-md text-sm font-medium text-white flex items-center gap-2 shadow-sm active:scale-95"
        >
          <LogOut size={16} />
          <span className="hidden lg:inline">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
}