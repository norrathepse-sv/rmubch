// components/RankingList.tsx
interface Stat {
  depreport: string | null;
  _count: { riskid: number };
}

interface RankingListProps {
  stats: Stat[];
  userDep: string;
}

export default function RankingList({ stats, userDep }: RankingListProps) {
  return (
    <div className="bg-white overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-20">ลำดับ</th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">หน่วยงาน</th>
            <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest w-32">จำนวน</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {stats.map((stat, index) => {
            const isMyDept = stat.depreport === userDep;

            return (
              <tr
                key={stat.depreport ?? index}
                id={isMyDept ? "my-dept-row" : undefined}
                className={`transition-colors duration-150 ${
                  isMyDept ? "bg-blue-50/50" : "hover:bg-slate-50/50"
                }`}
              >
                {/* ลำดับ - ใช้เลขธรรมดาแต่จัดวางให้สมดุล */}
                <td className="px-6 py-4">
                  <span className={`text-sm ${index < 3 ? "font-bold text-slate-800" : "text-slate-400"}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </td>

                {/* ชื่อหน่วยงาน - เน้นตัวหนาเฉพาะอันที่สำคัญ */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isMyDept ? "font-bold text-blue-600" : "text-slate-600 font-medium"}`}>
                      {stat.depreport || "ไม่ระบุหน่วยงาน"}
                    </span>
                    {isMyDept && (
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    )}
                  </div>
                </td>

                {/* จำนวน - ใช้ตัวเลขที่อ่านง่ายที่สุด */}
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-semibold ${isMyDept ? "text-blue-700" : "text-slate-800"}`}>
                    {stat._count.riskid.toLocaleString()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {stats.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-medium tracking-wide">ไม่พบข้อมูลสถิติ</p>
        </div>
      )}
    </div>
  );
}