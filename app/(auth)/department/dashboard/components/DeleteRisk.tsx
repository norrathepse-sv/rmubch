"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";


export default function DeleteRiskButton({ riskId }: { riskId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("ยืนยันการลบรายการอุบัติการณ์นี้? (ไม่สามารถย้อนกลับได้)")) return;

    try {
      const res = await fetch(`/api/risk/${riskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("ลบข้อมูลสำเร็จ");
        router.refresh(); // รีเฟรชข้อมูลหน้าเดิม
      } else {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-rose-200"
      title="ลบข้อมูล"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );
}