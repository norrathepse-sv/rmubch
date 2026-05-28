import { Info } from "lucide-react";

// สร้าง Component เล็กๆ ไว้เรียกใช้ซ้ำ
export const DrugErrorTooltip = ({ label, description }: { label: string, description: string }) => (
  <div className="group relative inline-block ml-1 cursor-help">
    <Info size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
    
    {/* Tooltip Content */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-50">
      <p className="font-bold border-b border-slate-600 pb-1 mb-1 text-blue-300">{label}</p>
      <p className="leading-relaxed opacity-90">{description}</p>
      {/* ลูกศร Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);