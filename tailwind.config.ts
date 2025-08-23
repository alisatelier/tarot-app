// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brandnavy: "#353B73",
        brandlightpink: "#F2E9E9", 
        brandpink:  "#FEDDE8",
        branddarkpink: "#FECFE0",
        brandgrey: "#A69FA5"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.08)",
        glow: "0 10px 25px rgba(255,93,162,0.25)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
