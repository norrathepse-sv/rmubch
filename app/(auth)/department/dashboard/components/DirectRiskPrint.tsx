"use client";

import { useEffect, useState } from "react";
import RiskPrintTemplate from "./RiskPrinterTemplate";

export default function DirectRiskPrint({
  riskId,
  onDone,
}: {
  riskId: number | null;
  onDone: () => void;
}) {
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!riskId) {
      setRisk(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`/api/risks/${riskId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message || "ไม่สามารถดึงข้อมูลได้");
        }
        return res.json();
      })
      .then((data) => {
        setRisk(data);
      })
      .catch((err: any) => {
        setError(err.message || "เกิดข้อผิดพลาด");
      })
      .finally(() => setLoading(false));
  }, [riskId]);

  useEffect(() => {
    if (risk) {
      const timer = window.setTimeout(() => {
        window.print();
        onDone();
      }, 300);

      return () => window.clearTimeout(timer);
    }
  }, [risk, onDone]);

  if (!riskId) return null;

  return (
    <div className="print-only-container">
      <RiskPrintTemplate risk={risk} />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 text-slate-700 text-sm">
          กำลังเตรียมข้อมูลสำหรับพิมพ์...
        </div>
      )}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
