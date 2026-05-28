"use client";

import { useMemo, useState, useTransition } from "react";
import { UserPlus, Search, MoreVertical, ChevronDown, KeyRound, ShieldCheck, User, ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react";
import { createDepartUser, updateDepartLevel, resetDepartPassword } from "../actions/userActions";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const LEVELS = [
  { value: "9", label: "Admin", desc: "เข้าถึงทุกอย่าง",      cls: "bg-slate-900 text-white" },
  { value: "0", label: "Staff", desc: "รายงาน + ดูของตัวเอง", cls: "bg-emerald-100 text-emerald-800" },
];

function levelLabel(v?: string | null) {
  return LEVELS.find((l) => l.value === v) ?? LEVELS[1];
}

interface DepUser {
  depid:    number;
  depname:  string | null;
  depuser:  string | null;
  deplevel: string | null;
}

export default function UsersTab({ users: init }: { users: DepUser[] }) {
  const [users, setUsers]            = useState(init);
  const [search, setSearch]          = useState("");
  const [showForm, setShowForm]      = useState(false);
  const [menuOpen, setMenuOpen]      = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast]            = useState<string | null>(null);
  const [form, setForm]              = useState({ depname: "", depuser: "", deppass: "", deplevel: "0" });

//---- pagination --//

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }
  
  const filtered = useMemo(() => {
    return users.filter((u) =>
      (u.depname ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.depuser ?? "").toLowerCase().includes(search.toLowerCase())
  );
}, [users, search]);

const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filtered.slice(startIndex, startIndex + rowsPerPage)

const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };
  async function handleCreate() {
    if (!form.depuser || !form.deppass) return;
    startTransition(async () => {
      const res = await createDepartUser(form);
      if (res.success && res.user) {
        setUsers((p) => [res.user!, ...p]);
        setForm({ depname: "", depuser: "", deppass: "", deplevel: "0" });
        setShowForm(false);
        showToast("เพิ่มผู้ใช้งานสำเร็จ");
      } else {
        showToast(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  async function handleLevelChange(depid: number, deplevel: string) {
    startTransition(async () => {
      await updateDepartLevel(depid, deplevel);
      setUsers((p) => p.map((u) => u.depid === depid ? { ...u, deplevel } : u));
      showToast("อัปเดตสิทธิ์สำเร็จ");
    });
  }

  async function handleReset(depid: number, name: string | null) {
    if (!confirm(`รีเซ็ตรหัสผ่านของ "${name ?? depid}"?`)) return;
    startTransition(async () => {
      const res = await resetDepartPassword(depid);
      if (res.success) showToast(`รหัสผ่านใหม่: ${res.tempPassword}`);
    });
    setMenuOpen(null);
  }

  

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ค้นหาชื่อ หรือ username..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} คน</span>
        <div className="flex-1" />
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-blue-600 transition-all"
        >
          <UserPlus size={14} /> เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-100 rounded-[1.5rem] p-6 space-y-4">
          <p className="text-sm font-black text-slate-800">เพิ่มผู้ใช้งานใหม่</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="ชื่อ-นามสกุล / ชื่อแผนก (depname)"
              value={form.depname}
              onChange={(e) => setForm({ ...form, depname: e.target.value })}
              className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            />
            <input
              placeholder="Username * (depuser)"
              value={form.depuser}
              onChange={(e) => setForm({ ...form, depuser: e.target.value })}
              className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            />
            <input
              placeholder="Password * (deppass)"
              type="password"
              value={form.deppass}
              onChange={(e) => setForm({ ...form, deppass: e.target.value })}
              className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            />
            <select
              value={form.deplevel}
              onChange={(e) => setForm({ ...form, deplevel: e.target.value })}
              className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label} — {l.desc}</option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-amber-600 font-medium">
            ⚠ รหัสผ่านจะถูกเก็บแบบ plaintext — แนะนำให้เพิ่ม bcrypt ในอนาคต
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-white transition-all"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleCreate}
              disabled={isPending || !form.depuser || !form.deppass}
              className="h-9 px-5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-blue-600 disabled:opacity-50 transition-all"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">ID</th>
              <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-4">ชื่อ / แผนก</th>
              <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-4">Username</th>
              <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-4">สิทธิ์</th>
              <th className="px-4 py-4 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedUsers.map((user) => { 
              const lvl = levelLabel(user.deplevel);
              return (
                <tr key={user.depid} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-xs text-slate-300 font-mono">{user.depid}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {user.deplevel === "9"
                          ? <ShieldCheck size={14} className="text-slate-600" />
                          : <User size={14} className="text-slate-400" />
                        }
                      </div>
                      <p className="text-sm font-bold text-slate-800">{user.depname ?? "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-500 font-mono">{user.depuser ?? "—"}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative inline-block">
                      <select
                        value={user.deplevel ?? "0"}
                        onChange={(e) => handleLevelChange(user.depid, e.target.value)}
                        className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-[11px] font-bold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 ${lvl.cls}`}
                      >
                        {LEVELS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === user.depid ? null : user.depid)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreVertical size={14} className="text-slate-400" />
                      </button>
                      {menuOpen === user.depid && (
                        <div className="absolute right-0 top-9 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-1.5 min-w-[160px]">
                          <button
                            onClick={() => handleReset(user.depid, user.depname)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <KeyRound size={13} className="text-amber-500" /> Reset password
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-300 text-sm">ไม่พบผู้ใช้งาน</td>
              </tr>
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              แสดง {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filtered.length)} จากทั้งหมด {filtered.length} คน
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronLeftCircleIcon size={16} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  // แสดงปุ่มเลขหน้าเฉพาะหน้าแรก, หน้าสุดท้าย และหน้าใกล้เคียง
                  if (pNum === 1 || pNum === totalPages || (pNum >= currentPage - 1 && pNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          currentPage === pNum
                            ? "bg-slate-900 text-white shadow-md"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  if (pNum === currentPage - 2 || pNum === currentPage + 2) {
                    return <span key={pNum} className="text-slate-300">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronRightCircleIcon size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
        
      

      

      {/* Legend */}
      <div className="flex gap-4">
        {LEVELS.map((l) => (
          <div key={l.value} className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${l.cls}`}>{l.label}</span>
            <span className="text-[11px] text-slate-400">{l.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}