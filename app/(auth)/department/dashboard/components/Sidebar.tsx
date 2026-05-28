"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Inbox, CheckCircle, Send, ChevronLeft, ChevronRight, 
  BarChart3, Clock, LayoutDashboard, ShieldCheck 
} from "lucide-react";

interface SidebarProps {
  currentStatus: string;
  searchQuery?: string;
  totalInbox: number;    // จำนวนที่หัวหน้าต้องตรวจ (Pending)
  totalSent: number;     // จำนวนที่ตรวจแล้ว (ขาออก)
  totalAll: number;      // จำนวนขาเข้าทั้งหมด (178)
}

export default function Sidebar({
  currentStatus,
  searchQuery,
  totalInbox,
  totalSent,
  totalAll,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // แบ่งกลุ่มเมนูเพื่อความชัดเจน
  // ส่วนที่ปรับปรุงในเมนู
const mainTasks = [
  { 
    id: "inbox", 
    label: "INBOX", 
    icon: Inbox, 
    count: totalInbox, 
    color: "blue" 
  },
  { 
    id: "outbound", 
    label: "รอหัวหน้างานตรวจสอบ", 
    icon: Send, 
    count: totalAll, // ยอด 3 รายการ
    color: "indigo" 
  },
];

const secondaryTasks = [

    { 
    id: "sent", 
    label: "ตรวจสอบแล้ว", 
    icon: CheckCircle, // หรือใช้ Icon Send ตามต้องการ
    count: totalSent, 
    color: "emerald" 
  },
];;
 
 const renderMenuItem = (item: any) => {
  const isActive = currentStatus === item.id;
  const Icon = item.icon;
  
  // เงื่อนไข: ถ้าเป็นเมนู outbound และมีข้อมูลมากกว่า 1 ให้แสดงจุดสีแดง
  const showRedDot = item.id === "outbound" && item.count > 1;

  return (
    <Link
      key={item.id}
      href={`?status=${item.id}${searchQuery ? `&search=${searchQuery}` : ""}`}
      className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
        isActive ? `bg-${item.color}-600 text-white shadow-lg scale-[1.02]` : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
          
          {/* ส่วนของจุดวงกลมสีแดง (Red Dot) */}
          {showRedDot && !isActive && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
            </span>
          )}
        </div>
        {!isCollapsed && <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
      </div>

      {!isCollapsed && (
        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg transition-all ${
          isActive 
            ? 'bg-white/30 text-white ring-1 ring-white/50' 
            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200' 
        }`}>
          {item.count.toLocaleString()}
        </span>
      )}
    </Link>
  );
};

  return (
    <aside className={`transition-all duration-300 sticky top-24 h-fit ${isCollapsed ? "w-20" : "w-full lg:w-72"}`}>
      <div className="bg-white rounded-[2rem] border border-slate-200/60 p-4 shadow-sm relative">
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:scale-110 transition-transform z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Section: Main Work */}
        <div className="mb-6">
          {!isCollapsed && <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">จัดการอุบัติการณ์</p>}
          <nav className="space-y-1">
            {mainTasks.map(renderMenuItem)}
          </nav>
        </div>

        {/* Section: Tracking */}
        <div className="mb-6">
          {!isCollapsed && <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">การติดตามงาน</p>}
          <nav className="space-y-1">
            {secondaryTasks.map(renderMenuItem)}
          </nav>
        </div>

        {/* Summary Card - Modern Style */}
 </div>
    </aside>
  );
}