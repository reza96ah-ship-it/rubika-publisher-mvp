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
          background: "#F6F8FA",
          surface: "#FFFFFF",
          border: "#E5E7EB",
          primary: "#03A9E6",
          primaryHover: "#0284C7",
          text: "#111827",
          muted: "#6B7280"
        }
      }
    }
  },
  plugins: []
};

export default config;
