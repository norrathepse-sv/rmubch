"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    labelTh: "ภาพรวม",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    accent: "blue",
  },
  {
    label: "Risk Management",
    labelTh: "จัดการความเสี่ยง",
    href: "/admin/dashboard/risks",
    icon: ShieldAlert,
    accent: "rose",
  },
  // {
  //   label: "Reports",
  //   labelTh: "รายงาน",
  //   href: "/admin/dashboard/reports",
  //   icon: BarChart3,
  //   accent: "emerald",
  // },
  {
    label: "Settings",
    labelTh: "ตั้งค่าระบบ",
    href: "/admin/settings",
    icon: Settings,
    accent: "slate",
  },
];

const accentMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/30",    glow: "shadow-blue-500/20" },
  rose:    { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/30",    glow: "shadow-rose-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" },
  slate:   { bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-500/30",   glow: "shadow-slate-500/20" },
};

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`
        relative flex flex-col h-screen bg-[#0a0f1e] border-r border-white/5
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[240px]"}
      `}
    >
      {/* ── Subtle grid texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 24px,white 24px,white 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,white 24px,white 25px)",
        }}
      />

      {/* ── Logo area ── */}
      <div className="relative flex items-center gap-3 px-4 py-5 border-b border-white/5 overflow-hidden">
        {/* Animated glow dot */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Activity size={18} className="text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0f1e] animate-pulse" />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-black text-xl tracking-tight leading-none truncate">
              RMUBCH
            </p>
            <p className="text-slate-500 text-xs font-medium mt-0.5 truncate">
              Risk Management System
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="relative flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-lg text-slate-600 font-bold uppercase tracking-[0.15em] px-3 pb-2">
            Main Menu
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const colors = accentMap[item.accent];
          // Active: exact match for dashboard, startsWith for others
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? `${item.label} — ${item.labelTh}` : undefined}
              className={`
                group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                border transition-all duration-200
                ${
                  isActive
                    ? `${colors.bg} ${colors.border} shadow-md ${colors.glow}`
                    : "border-transparent hover:bg-white/5 hover:border-white/5"
                }
                ${collapsed ? "justify-center" : ""}
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${colors.text.replace("text-", "bg-")}`}
                />
              )}

              <Icon
                size={18}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? colors.text : "text-slate-500 group-hover:text-slate-300"
                }`}
              />

              {!collapsed && (
                <div className="min-w-0 leading-none">
                  <p
                    className={`text-lg font-bold truncate transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-sm truncate transition-colors ${
                      isActive ? colors.text : "text-slate-600 group-hover:text-slate-500"
                    }`}
                  >
                    {item.labelTh}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: Logout ── */}
      <div className="relative px-2 py-3 border-t border-white/5">
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-slate-600 hover:text-rose-400 hover:bg-rose-500/5
            border border-transparent hover:border-rose-500/20
            transition-all duration-200 group
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-bold">Logout</span>
          )}
        </button>
      </div>

      {/* ── Collapse toggle button ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="
          absolute -right-3 top-[72px]
          w-6 h-6 rounded-full
          bg-[#0a0f1e] border border-white/10
          flex items-center justify-center
          text-slate-400 hover:text-white hover:border-blue-500/50
          shadow-lg transition-all duration-200
          z-10
        "
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
