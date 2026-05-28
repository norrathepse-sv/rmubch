"use client";

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // ย้อนกลับไปหน้าที่ผ่านมา 1 Step
    router.back();
    
    // หมายเหตุ: router.refresh() มักจะไม่ทำงานทันทีหลัง back() 
    // เพราะ back() เป็นการทำงานของ Browser History
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium group"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 transition-transform group-hover:-translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      ย้อนกลับ
    </button>
  );
}