import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RMUBCH - Risk Management System',
    short_name: 'RMUBCH',
    description: 'ระบบรายงานอุบัติการณ์และความเสี่ยง โรงพยาบาลอุบลรักษ์ ธนบุรี',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617', // สีพื้นหลังหน้า Welcome ของคุณ
    theme_color: '#2563eb',      // สีฟ้าของโลโก้ ShieldCheck
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}