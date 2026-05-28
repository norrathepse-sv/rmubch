import type { Metadata } from "next";
import { Anuphan } from 'next/font/google'
import "./globals.css";
import { NextAuthProvider } from "./(auth)/department/dashboard/components/NextAuthProvider";
import { Toaster } from "react-hot-toast";

const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-anuphan', // สร้างเป็น CSS Variable
})

export const metadata: Metadata = {
  title: "ระบบรายงานอุบัติการณ์ความเสี่ยง",
  description: "ระบบรายงานอุบัติการณ์",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // ป้องกันการซูมเข้าออก เพื่อให้ความรู้สึกเหมือนแอปจริง
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anuphan.variable} font-sans antialiased`}
      >
        <NextAuthProvider>
          <Toaster 
          position="top-right"
          toastOptions={{
            // ตั้งค่า Font ให้เป็น Anuphan ตามธีมหลัก
            className: 'font-sans text-sm',
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#334155',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981', // สีเขียว Emerald
              },
            },
            error: {
              style: {
                background: '#ef4444', // สีแดง Red
              },
            },
          }}
        />
        {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
