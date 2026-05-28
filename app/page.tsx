"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import UpdateModal from "./(auth)/login/components/UpdateModal";


export default function LoginPage() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showUpdate, setShowUpdate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn("credentials", {
        username: username,
        password: password,
        redirect: false,
      });

      if (result?.ok) {
        window.location.href = "/check-role"; 
      } else {
        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-cover bg-center"
      // แนะนำให้ใช้ภาพพื้นหลังโทนสีฟ้า/น้ำเงิน หรือภาพอาคารโรงพยาบาลที่ดูทันสมัย
      style={{ backgroundImage: "url('../images/Bg/hospital-with-blurred-effect.jpg')" }}
    >
      {/* Overlay สีดำจางๆ เพื่อให้ตัวหนังสืออ่านง่ายและดูพรีเมียมขึ้น */}
      <div className="absolute inset-0 bg-slate-900/60 z-0"></div>

      <div className="relative z-10 w-full max-w-6xl  grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* คอลัมน์ซ้าย: ข้อความโปรโมท (แนวทางที่ 2) */}
        <div className="text-white space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* ไอคอนโรงพยาบาล */}
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-sm shadow-lg">
              <svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-blue-300"
              >
                <path d="M5 22V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                <path d="M2 22h20" />
                <path d="M12 6v4" />
                <path d="M14 8h-4" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-widest text-white/90"></span>
          </div>

          {/* คำโปรยหลัก */}
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
            RISK <br /> <span className="text-blue-400">MANAGEMENT</span>
          </h1>
          
          <p className="text-lg font-medium max-w-md pt-2 text-blue-100">
            ระบบจัดการความเสี่ยง โรงพยาบาลมะเร็งอุบลราชธานี
          </p>
          
          <p className="text-sm text-white/70 max-w-md font-light leading-relaxed mt-2">
            ลดความซับซ้อน ลดงานเอกสาร ด้วยระบบที่ออกแบบมาให้ตอบสนองฉับไว เชื่อมโยงทุกหน่วยงานเป็นหนึ่งเดียว
          </p>
        </div>

        {/* คอลัมน์ขวา: ฟอร์ม Login (Glassmorphism) */}
        <div className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[2rem] p-8 lg:p-10 shadow-2xl">
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white tracking-wide">Sign In</h2>
              <p className="text-white/60 text-sm mt-1">เข้าสู่ระบบเพื่อจัดการรายงานความเสี่ยง</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-white/90 text-[13px] font-medium tracking-wide">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-white/90 focus:bg-white rounded-xl border-0 px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 placeholder:text-slate-400 transition-all text-sm font-medium shadow-inner"
                  placeholder="ชื่อผู้ใช้งาน"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-white/90 text-[13px] font-medium tracking-wide">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/90 focus:bg-white rounded-xl border-0 px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 placeholder:text-slate-400 transition-all text-sm font-medium shadow-inner"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>กำลังเข้าสู่ระบบ...</span>
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </button>
              </div>
            </form>

            {/* ปุ่ม Update Modal และ Contact */}
            <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center text-xs text-white/50">
              <button 
                onClick={() => setShowUpdate(true)}
                className="flex items-center gap-2 hover:text-white transition-colors group bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400 group-hover:bg-orange-400"></span>
                </span>
                <span className="font-medium">Version 1.3</span>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                <span>IT Support: 8122</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <UpdateModal
        isOpen={showUpdate} 
        onClose={() => setShowUpdate(false)} 
      />
    </div>
  );
}