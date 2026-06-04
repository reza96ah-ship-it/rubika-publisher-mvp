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
          background: "rgb(var(--n-color-canvas) / <alpha-value>)",
          canvas: "rgb(var(--n-color-canvas-soft) / <alpha-value>)",
          surface: "rgb(var(--n-color-surface) / <alpha-value>)",
          surfaceMuted: "rgb(var(--n-color-surface-muted) / <alpha-value>)",
          border: "rgb(var(--n-color-border) / <alpha-value>)",
          borderStrong: "rgb(var(--n-color-border-strong) / <alpha-value>)",
          primary: "rgb(var(--n-color-primary) / <alpha-value>)",
          primaryHover: "rgb(var(--n-color-primary-strong) / <alpha-value>)",
          text: "rgb(var(--n-color-ink) / <alpha-value>)",
          muted: "rgb(var(--n-color-muted) / <alpha-value>)",
          soft: "rgb(var(--n-color-primary-soft) / <alpha-value>)",
          success: "rgb(var(--n-color-success) / <alpha-value>)",
          warning: "rgb(var(--n-color-warning) / <alpha-value>)",
          alert: "rgb(var(--n-color-alert) / <alpha-value>)",
          teal: "rgb(var(--n-color-primary) / <alpha-value>)",
          tealSoft: "rgb(var(--n-color-primary-soft) / <alpha-value>)",
          coral: "rgb(var(--n-color-coral) / <alpha-value>)",
          coralSoft: "rgb(var(--n-color-coral-soft) / <alpha-value>)",
          plum: "rgb(var(--n-color-plum) / <alpha-value>)",
          plumSoft: "rgb(var(--n-color-plum-soft) / <alpha-value>)"
        }
      },
      boxShadow: {
        hairline: "var(--n-shadow-hairline)",
        soft: "var(--n-shadow-soft)",
        lift: "var(--n-shadow-lift)",
        accent: "0 10px 22px rgb(var(--n-color-primary) / 0.18)",
        studio: "var(--n-shadow-studio)"
      }
    }
  },
  plugins: []
};

export default config;
