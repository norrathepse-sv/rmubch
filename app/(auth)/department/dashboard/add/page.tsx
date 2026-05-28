// app/risks/add/page.tsx
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import AddRiskForm from "../components/AddRickForm";
// เช็คชื่อไฟล์ตรงนี้ด้วยนะครับว่าสะกดถูกไหม

export default function AddRiskPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        
        {/* ปุ่มย้อนกลับ */}
        <div className="max-w-8xl mx-auto mb-6">
          <Link 
            href="/department/dashboard" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-500 bg-white rounded-xl border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm transition-all group"
          >
            <ArrowLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            ย้อนกลับไปหน้าแดชบอร์ด
          </Link>
        </div>

        {/* เรียกใช้ Form */}
        <AddRiskForm />
        
      </div>
    </div>
  );
}