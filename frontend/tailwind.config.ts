import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "Arial", "sans-serif"]
      },
      colors: {
        app: {
          background: "#F7F9FC",
          canvas: "#FBFCFE",
          surface: "#FFFFFF",
          surfaceMuted: "#F8FAFC",
          border: "#E2E8F0",
          borderStrong: "#CBD5E1",
          primary: "#245FE8",
          primaryHover: "#1D4ED8",
          text: "#162033",
          muted: "#64748B",
          soft: "#EEF6FF",
          success: "#059669",
          warning: "#D97706",
          alert: "#E11D48"
        }
      },
      boxShadow: {
        hairline: "0 0 0 1px rgba(226, 232, 240, 0.92)",
        soft: "0 10px 24px rgba(30, 41, 59, 0.06)",
        lift: "0 16px 38px rgba(30, 41, 59, 0.09)",
        accent: "0 8px 18px rgba(36, 95, 232, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
