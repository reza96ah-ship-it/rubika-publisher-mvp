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
          background: "#F8FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          primary: "#1D4ED8",
          primaryHover: "#1E40AF",
          text: "#111827",
          muted: "#64748B"
        }
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
