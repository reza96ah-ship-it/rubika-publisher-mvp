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
          background: "#F6F8FB",
          surface: "#FFFFFF",
          border: "#DDE7F0",
          primary: "#2563EB",
          primaryHover: "#1D4ED8",
          text: "#172033",
          muted: "#667085",
          soft: "#EEF6FF",
          success: "#059669",
          warning: "#D97706",
          alert: "#E11D48"
        }
      },
      boxShadow: {
        soft: "0 10px 24px rgba(37, 99, 235, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
