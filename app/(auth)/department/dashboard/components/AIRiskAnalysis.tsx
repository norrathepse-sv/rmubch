"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface AIRiskAnalysisProps {
  text: string;
  options: any;
  onSelect?: (type: "clinic" | "gen", code: string) => void;
}

export default function AIRiskAnalysis({ text, options, onSelect }: AIRiskAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeIncident = async () => {
    if (!text || text.length < 10) return;
    setLoading(true);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          severityOptions: {
            clinic: options?.severityClinic?.map((s: any) => ({
              code: s.grlvcode,
              name: s.grlvname,
            })),
            gen: options?.severityGen?.map((s: any) => ({
              code: s.grlvcode,
              name: s.grlvname,
            })),
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysis(data);
      } else {
        throw new Error(data.error || "API Error");
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAnalysis({
        summary: "ไม่สามารถวิเคราะห์ได้ในขณะนี้",
        recommendedClinic: "-",
        recommendedGen: "-",
        reason: "การเชื่อมต่อ API ขัดข้อง",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!text || text.length < 10) return null;

  return (
    <div className="mt-4 overflow-hidden border border-blue-100 rounded-2xl bg-white shadow-sm transition-all">
      <div className="flex items-center justify-between bg-blue-50/50 px-4 py-3">
        <div className="flex items-center gap-2 text-blue-700">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-bold">AI Assistant วิเคราะห์เหตุการณ์</span>
        </div>

        {/* เพิ่ม type="button" เพื่อป้องกันการ submit form */}
        <button
          type="button" 
          onClick={analyzeIncident}
          disabled={loading}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all ${
            loading
              ? "bg-slate-100 text-slate-400"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-95"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>กำลังวิเคราะห์...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              <span>{analysis ? "วิเคราะห์ใหม่อีกครั้ง" : "กดเพื่อวิเคราะห์"}</span>
            </>
          )}
        </button>
      </div>

      {analysis && !loading && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1">
          {/* Summary Section */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white uppercase ${
                  analysis.severityScore === "High"
                    ? "bg-red-500"
                    : analysis.severityScore === "Medium"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              >
                {analysis.severityScore} Risk
              </span>
            </div>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              <span className="text-blue-600 font-bold">สรุป:</span> {analysis.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Clinic Result */}
            {(() => {
              const isHighClinic = analysis.recommendedClinic >= "E" && analysis.recommendedClinic <= "I";
              return (
                <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all shadow-sm ${
                  isHighClinic ? "border-red-100 bg-red-50/40" : "border-rose-100 bg-rose-50/30"
                }`}>
                  <div className={`flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center text-white rounded-xl shadow-md ${
                    isHighClinic ? "bg-red-600 shadow-red-200" : "bg-rose-600 shadow-rose-200"
                  }`}>
                    <span className="text-[9px] font-bold opacity-80">CLINIC</span>
                    <span className="text-xl font-black">{analysis.recommendedClinic}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-[13px] font-bold leading-tight ${isHighClinic ? "text-red-900" : "text-rose-900"}`}>
                      {analysis.clinicDesc}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelect?.("clinic", analysis.recommendedClinic)}
                      className={`mt-2 text-xs font-bold px-3 py-1 rounded-lg transition-all active:scale-95 shadow-sm ${
                        isHighClinic ? "bg-red-600 hover:bg-red-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                      }`}
                    >
                      เลือก
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* General Result */}
            {(() => {
              const isHighGen = Number(analysis.recommendedGen) > 4 && Number(analysis.recommendedGen) !== 10;
              return (
                <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all shadow-sm ${
                  isHighGen ? "border-red-100 bg-red-50/40" : "border-amber-100 bg-amber-50/30"
                }`}>
                  <div className={`flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center text-white rounded-xl shadow-md ${
                    isHighGen ? "bg-red-600 shadow-red-200" : "bg-amber-500 shadow-amber-100"
                  }`}>
                    <span className="text-[9px] font-bold opacity-80">GEN</span>
                    <span className="text-xl font-black">{analysis.recommendedGen}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-[13px] font-bold leading-tight ${isHighGen ? "text-red-900" : "text-amber-900"}`}>
                      {analysis.genDesc}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelect?.("gen", analysis.recommendedGen)}
                      className={`mt-2 text-xs font-bold px-3 py-1 rounded-lg transition-all active:scale-95 shadow-sm ${
                        isHighGen ? "bg-red-600 hover:bg-red-700 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
                      }`}
                    >
                      เลือก
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Reason Footer */}
          <div className="px-1 border-t border-slate-50 pt-2">
            <p className="text-[11px] text-slate-400 italic">
              <strong>วิเคราะห์จาก:</strong> {analysis.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}