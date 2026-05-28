'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ดึงค่า Search เดิมจาก URL มาโชว์ในช่อง Input
  const [text, setText] = useState(searchParams.get('search') || '');

  useEffect(() => {
    // หน่วงเวลา 500ms หลังจากหยุดพิมพ์
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (text) {
        params.set('search', text);
        params.set('page', '1'); // ค้นหาใหม่ให้เริ่มที่หน้า 1 เสมอ
      } else {
        params.delete('search');
      }
      
      // อัปเดต URL โดยไม่รีโหลดหน้า (Soft Navigation)
      router.push(`?${params.toString()}`);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [text, router, searchParams]);

  return (
    <div className="relative w-full md:w-96 mb-6">
      <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
      <input
        type="text"
        value={text}
        placeholder="ค้นหา HN หรือ ชื่อผู้ประสบปัญหา (Auto)..."
        onChange={(e) => setText(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm bg-white"
      />
      {text && (
        <button 
          onClick={() => setText('')}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}