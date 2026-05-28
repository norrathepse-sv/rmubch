"use client";

import { X } from "lucide-react";

export default function UpdateModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Background Overlay - จางมากๆ */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Content - เน้นความขาว สะอาด ตา */}
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 transition-all">
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">What's New</h2>
            <p className="text-slate-400 text-xs mt-1">Version 1.3</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 text-left">
          {/* รายการอัปเดตแบบเรียบๆ ไม่มีไอคอนสี */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">ระบบจัดการข้อมูล</h4>
            <p className="text-slate-500 text-xs leading-relaxed ml-4">เพิ่มฟังชั่นตอบกลับของหัวหน้าหน่วยงาน</p>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">ระบบส่งออกข้อมูล</h4>
            <div className="ml-4">
            <p className="text-slate-500 text-xs leading-relaxed"> เพิ่มการ export excel ใน Dashboard</p>
            </div>         
          </div>

         

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">ตารางความเสี่ยง</h4>
            <div className="ml-4">
            <p className="text-slate-500 text-xs leading-relaxed">เพิ่มสถานะตอบกลับเครื่องหมายถูกสีส้ม</p>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">ระบบส่งออกข้อมูล</h4>
            <div className="ml-4">
            <p className="text-slate-500 text-xs leading-relaxed">เพิ่มการ export excel ใน Dashboard</p>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Login</h4>
            <div className="ml-4">
            <p className="text-slate-500 text-xs leading-relaxed">Loginpage เป็น UX/UI</p>
            </div>
          </div>


        </div>

        <button 
          onClick={onClose}
          className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-4 rounded-2xl transition-all"
        >
          รับทราบ
        </button>
      </div>
    </div>
  );
}