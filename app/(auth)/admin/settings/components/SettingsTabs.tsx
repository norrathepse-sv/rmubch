"use client";

import { useState } from "react";
import { Users, ShieldAlert, Settings2, Building2 } from "lucide-react";
import UsersTab      from "./UsersTab";
import RiskConfigTab from "./RiskConfigTab";
import SystemTab from "./SystemTab";


const TABS = [
  { id: "users",  label: "ผู้ใช้งาน",       labelEn: "Users & Roles", icon: Users },
  { id: "risk",   label: "ความเสี่ยง",      labelEn: "Risk Config",   icon: ShieldAlert },
  { id: "ward",   label: "แผนก / หน่วยงาน", labelEn: "Wards",         icon: Building2 },
  { id: "system", label: "ระบบ / ทั่วไป",   labelEn: "System",        icon: Settings2 },
];

interface Props {
  users:        any[];
  riskGroups:   any[];
  riskGroupDts: any[];
  riskGroupLvs: any[];
  slaDays:      number;
  nearMissCode: string;
  auditLogs:       any[];
  auditTotal:      number;
  totalRisks:      number;
  totalUsers:      number;
  hospitalName:    string;
  hospitalSubname: string;
  logoUrl:         string;
  appVersion:      string;
  dbVersion:       string;
 
}

export default function SettingsTabs({
  users,
  riskGroups,
  riskGroupDts,
  riskGroupLvs,
  slaDays,
  nearMissCode,
  auditLogs,
  auditTotal,
  totalRisks,
  totalUsers,
  hospitalName,
  hospitalSubname,
  logoUrl,
  appVersion,
  dbVersion,
}: Props) {
  const [active, setActive] = useState("users");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-8 pt-8 pb-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Settings2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">ตั้งค่าระบบ</h1>
              <p className="text-slate-400 text-sm font-medium">System Settings — RMUBCH Risk Management</p>
            </div>
          </div>
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl border-b-2 transition-all ${
                    isActive
                      ? "border-slate-900 text-slate-900 bg-slate-50"
                      : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                  <span className={`text-[10px] font-medium ${isActive ? "text-slate-400" : "text-slate-300"}`}>
                    {tab.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {active === "users" && <UsersTab users={users} />}
        {active === "risk"  && (
          <RiskConfigTab
            riskGroups={riskGroups}
            riskGroupDts={riskGroupDts}
            riskGroupLvs={riskGroupLvs}
            slaDays={slaDays}
            nearMissCode={nearMissCode}
          />
        )}
        {active === "system" && (
        <SystemTab
          hospitalName={hospitalName}
          hospitalSubname={hospitalSubname}
          logoUrl={logoUrl}
          auditLogs={auditLogs}
          auditTotal={auditTotal}
          appVersion={appVersion}
          dbVersion={dbVersion}
          totalRisks={totalRisks}
          totalUsers={totalUsers}
        />
      )}
      </div>
    </div>
  );
}