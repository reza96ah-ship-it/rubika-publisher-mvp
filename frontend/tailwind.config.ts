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
          background: "#EEF4F6",
          canvas: "#F8FBFC",
          surface: "#FFFFFF",
          surfaceMuted: "#F5F8FA",
          border: "#DCE5EA",
          borderStrong: "#C7D5DD",
          primary: "#245FE8",
          primaryHover: "#1D4ED8",
          text: "#172332",
          muted: "#647483",
          soft: "#EEF6FF",
          success: "#0F8A77",
          warning: "#C27803",
          alert: "#D94F62",
          teal: "#0F766E",
          tealSoft: "#E8F6F3",
          coral: "#E95757",
          coralSoft: "#FFF0EE",
          plum: "#7C3AED",
          plumSoft: "#F3EEFF"
        }
      },
      boxShadow: {
        hairline: "0 0 0 1px rgba(207, 220, 226, 0.88)",
        soft: "0 12px 28px rgba(33, 61, 75, 0.07)",
        lift: "0 18px 44px rgba(33, 61, 75, 0.11)",
        accent: "0 10px 22px rgba(36, 95, 232, 0.22)",
        studio: "0 20px 52px rgba(38, 75, 88, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
