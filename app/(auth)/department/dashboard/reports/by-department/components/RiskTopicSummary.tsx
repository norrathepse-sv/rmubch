// components/RiskTopicSummary.tsx
"use client"; // อย่าลืมใส่ "use client" เพราะมีการใช้ useState

import { ArrowDownLeft, ArrowUpRight, Building2, Loader2, ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface RiskStat {
  risktype: string | null;
  depreport?: string | null;
  todep?: string | null;
  _count: { riskid: number };
}

interface RiskTopicSummaryProps {
  inboundStats: RiskStat[];
  outboundStats: RiskStat[];
}

export default function RiskTopicSummary({ inboundStats, outboundStats }: RiskTopicSummaryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [listData, setListData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetail = async (risktype: string, dept: string, mode: 'inbound' | 'outbound') => {
    setIsLoading(true);
    setIsModalOpen(true);
    setModalTitle(`${risktype} (${dept})`);
    
    try {
      // ดึงข้อมูลผ่าน API
      const res = await fetch(`/api/risks?type=${encodeURIComponent(risktype)}&dept=${encodeURIComponent(dept)}&mode=${mode}`);
      const data = await res.json();
      setListData(data);
    } catch (error) {
      console.error("Failed to fetch", error);
      setListData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📥 Inbound */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <ArrowDownLeft size={16} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">ความเสี่ยงที่รายงานถึงหน่วยงานเรา</h3>
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">Inbound</span>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <RiskTable 
              stats={inboundStats} 
              themeColor="blue" 
              type="inbound" 
              onViewDetail={(t, d) => handleViewDetail(t, d, 'inbound')} 
            />
          </div>
        </section>

        {/* 📤 Outbound */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                <ArrowUpRight size={16} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">ความเสี่ยงที่หน่วยงานเราส่งออก</h3>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">Outbound</span>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <RiskTable 
              stats={outboundStats} 
              themeColor="indigo" 
              type="outbound" 
              onViewDetail={(t, d) => handleViewDetail(t, d, 'outbound')} 
            />
          </div>
        </section>
      </div>

      {/* --- Modal Layout --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">{modalTitle}</h3>
                <p className="text-xs text-slate-500">พบ {listData.length} รายการที่สอดคล้อง</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                  <p className="text-sm text-slate-400">กำลังดึงข้อมูลรายการ...</p>
                </div>
              ) : listData.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {listData.map((risk) => (
                    <a 
                      key={risk.riskid}
                      href={`/department/dashboard/${risk.riskid}`} // ลิงก์ไปยังหน้ารายละเอียด
                      className="flex items-center justify-between p-5 hover:bg-blue-50/50 transition-colors group"
                    >
                      <div className="flex flex-col gap-1 max-w-[90%]">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-slate-400 bg-white border px-2 py-0.5 rounded shadow-sm">
                            {new Date(risk.daterigter).toLocaleDateString('th-TH')}
                          </span>
                          <span className={`text-xs font-bold ${
                             ["E","F","G","H","I"].includes(risk.clinicseverity?.charAt(0)) ? 'text-red-500' : 'text-orange-500'
                          }`}>
                            Level {risk.clinicseverity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium line-clamp-1">{risk.riskdetail}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 text-sm italic">ไม่พบข้อมูลรายละเอียด</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Sub Component: RiskTable ---
function RiskTable({ 
  stats, 
  themeColor, 
  type, 
  onViewDetail 
}: { 
  stats: RiskStat[], 
  themeColor: 'blue' | 'indigo', 
  type: 'inbound' | 'outbound',
  onViewDetail: (type: string, dept: string) => void // รับฟังก์ชันคลิกมาจากตัวแม่
}) {
  if (stats.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 font-medium">ไม่พบข้อมูลความเสี่ยง</div>
    );
  }

  const maxCount = Math.max(...stats.map(s => s._count.riskid));
  const accentClass = themeColor === 'blue' ? 'text-blue-600' : 'text-indigo-600';
  const barClass = themeColor === 'blue' ? 'bg-blue-500' : 'bg-indigo-500';

  return (
    <table className="w-full border-collapse">
      <tbody className="divide-y divide-slate-50">
        {stats.map((stat, idx) => {
          const deptName = type === 'inbound' ? stat.depreport : stat.todep;

          return (
            <tr 
              key={idx} 
              className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
              onClick={() => onViewDetail(stat.risktype || "", deptName || "")} // ส่งข้อมูลกลับไปตัวแม่เมื่อคลิก
            >
              <td className="px-5 py-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 leading-tight mb-0.5 group-hover:text-blue-600 transition-colors">
                      {stat.risktype || "ไม่ระบุประเภท"}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Building2 size={10} />
                      {type === 'inbound' ? 'รายงานโดย: ' : 'ส่งถึง: '}
                      <span className={accentClass}>{deptName || "-"}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${accentClass} ml-4`}>
                    {stat._count.riskid.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full ${barClass} transition-all duration-500`}
                    style={{ width: `${(stat._count.riskid / maxCount) * 100}%` }}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}