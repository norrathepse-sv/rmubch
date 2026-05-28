import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 3. ผูกชื่อ font เข้ากับ CSS Variable ที่เราตั้งไว้ใน layout
        sans: ["var(--font-anuphan)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;